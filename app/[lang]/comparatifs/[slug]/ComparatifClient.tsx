"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getComparatifBySlug, COMPARATIFS, type ToolScore } from "../../lib/comparatifs";
import { ARTICLES } from "../../lib/articles";
import { useNewsletter } from "@/lib/useNewsletter";

type Lang = "fr" | "en";
type Tab = "overview" | "details" | "analysis";

const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", Rédaction: "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", Productivité: "#10b981",
  Productivity: "#10b981", Audio: "#ef4444", Video: "#a855f7", Vidéo: "#a855f7",
};

// ─── Slugify ──────────────────────────────────────────────────────────────────
const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

// ─── Lecture estimée ──────────────────────────────────────────────────────────
const readTime = (text: string) => Math.max(4, Math.ceil(text.split(/\s+/).length / 200));

// ─── isNew ────────────────────────────────────────────────────────────────────
const isNew = (d: string) => {
  try { return (Date.now() - new Date(d).getTime()) / 86400000 <= 12; }
  catch { return false; }
};

// ─── Score bar animée ─────────────────────────────────────────────────────────
function ScoreBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(value * 10), delay); ob.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [value, delay]);
  const sc = value >= 9 ? "#00e6be" : value >= 7.5 ? "#3b82f6" : value >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
      <div ref={ref} style={{ flex: 1, height: 5, background: "var(--bg3)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 1s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 8px ${color}45` }} />
      </div>
      <span style={{ fontFamily: "var(--m)", fontSize: "0.72rem", fontWeight: 700, color: sc, minWidth: 26, textAlign: "right" as const }}>{value.toFixed(1)}</span>
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
    <svg viewBox="0 0 260 260" style={{ width: "100%", maxWidth: 300 }}>
      {[0.25, 0.5, 0.75, 1].map(lv => (
        <polygon key={lv} points={angles.map(a => { const p = pt(lv * R, a); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth={1} />
      ))}
      {angles.map((a, i) => { const p = pt(R, a); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.055)" strokeWidth={1} />; })}
      {tools.map((tool, ti) => (
        <polygon key={tool.name} points={poly(tool)}
          fill={`${tool.color}15`} stroke={tool.color} strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round"
          style={{ opacity: 0, animation: `radarIn 0.6s ease ${ti * 150}ms forwards` }} />
      ))}
      {criteria.map((label, i) => {
        const p = pt(R + 20, angles[i]);
        return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.35)" fontSize={7} fontFamily="JetBrains Mono,monospace">{label}</text>;
      })}
    </svg>
  );
}

// ─── Quick Compare Table ──────────────────────────────────────────────────────
function QuickCompare({ tools, lang, l, L }: { tools: ToolScore[]; lang: Lang; l: (p: string) => string; L: Record<string,string> }) {
  const sorted = [...tools].sort((a, b) => b.globalScore - a.globalScore);
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: "2.5rem" }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="sec-tag" style={{ marginBottom: 0 }}>⚡ {L.quickCompare}</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--m)", fontSize: "0.75rem" }}>
          <thead>
            <tr style={{ background: "var(--bg3)" }}>
              <th style={{ padding: "10px 16px", textAlign: "left" as const, color: "var(--dim)", fontWeight: 400, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{L.tool}</th>
              <th style={{ padding: "10px 16px", textAlign: "center" as const, color: "var(--dim)", fontWeight: 400, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{L.score}</th>
              <th style={{ padding: "10px 16px", textAlign: "center" as const, color: "var(--dim)", fontWeight: 400, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{L.pricingLabel}</th>
              <th style={{ padding: "10px 16px", textAlign: "center" as const, color: "var(--dim)", fontWeight: 400, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>CTA</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((tool, i) => {
              const isWin = i === 0;
              return (
                <tr key={tool.name} style={{ borderTop: "1px solid var(--border)", background: isWin ? `${tool.color}05` : "transparent" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.1rem" }}>{tool.logo}</span>
                      <div>
                        <div style={{ fontFamily: "var(--d)", fontWeight: isWin ? 800 : 600, color: isWin ? tool.color : "var(--text)", fontSize: "0.88rem" }}>
                          {isWin && "🏆 "}{tool.name}
                        </div>
                        {tool.badge && <div style={{ fontSize: "0.6rem", color: tool.color, marginTop: "0.1rem" }}>{tool.badge[lang]}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" as const }}>
                    <span style={{ fontFamily: "var(--d)", fontSize: "1.1rem", fontWeight: 800, color: tool.color }}>{tool.globalScore.toFixed(1)}</span>
                    <span style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color: "var(--dim)" }}>/10</span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" as const }}>
                    <span style={{ fontFamily: "var(--m)", fontSize: "0.7rem", color: "var(--muted)", fontWeight: 300 }}>{tool.price}</span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" as const }}>
                    {tool.affiliate ? (
                      <a href={tool.affiliate} target="_blank" rel="noopener noreferrer sponsored"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: isWin ? tool.color : "transparent", color: isWin ? "#080c10" : tool.color, border: `1px solid ${tool.color}`, borderRadius: 7, padding: "6px 14px", fontFamily: "var(--d)", fontWeight: 700, fontSize: "0.73rem", textDecoration: "none", whiteSpace: "nowrap" as const, transition: "all 0.18s" }}>
                        {isWin ? (lang === "fr" ? "Essayer →" : "Try →") : (lang === "fr" ? "Voir →" : "View →")}
                      </a>
                    ) : <span style={{ color: "var(--dim)", fontSize: "0.7rem" }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Best For section ─────────────────────────────────────────────────────────
function BestForSection({ tools, lang, L }: { tools: ToolScore[]; lang: Lang; L: Record<string,string> }) {
  const profiles = lang === "fr" ? [
    { icon: "🚀", label: "Débutant", desc: "Première fois avec cet outil", pick: tools.reduce((a, b) => a.globalScore <= b.globalScore ? a : b) },
    { icon: "💼", label: "Professionnel", desc: "Usage quotidien intensif", pick: tools.reduce((a, b) => a.globalScore >= b.globalScore ? a : b) },
    { icon: "💰", label: "Budget serré", desc: "Meilleur rapport qualité/prix", pick: [...tools].sort((a, b) => a.price.localeCompare(b.price))[0] },
    { icon: "⚡", label: "Power user", desc: "Fonctionnalités avancées", pick: tools.reduce((a, b) => a.globalScore >= b.globalScore ? a : b) },
  ] : [
    { icon: "🚀", label: "Beginner", desc: "First time with this type of tool", pick: tools.reduce((a, b) => a.globalScore <= b.globalScore ? a : b) },
    { icon: "💼", label: "Professional", desc: "Daily intensive use", pick: tools.reduce((a, b) => a.globalScore >= b.globalScore ? a : b) },
    { icon: "💰", label: "Budget-conscious", desc: "Best value for money", pick: [...tools].sort((a, b) => a.price.localeCompare(b.price))[0] },
    { icon: "⚡", label: "Power user", desc: "Advanced features needed", pick: tools.reduce((a, b) => a.globalScore >= b.globalScore ? a : b) },
  ];
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", marginBottom: "2.5rem" }}>
      <div className="sec-tag">{L.bestFor}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "0.85rem" }}>
        {profiles.map((p, i) => (
          <div key={i} style={{ background: "var(--bg3)", border: `1px solid ${p.pick.color}25`, borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column" as const, gap: "0.45rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>{p.icon}</span>
              <span style={{ fontFamily: "var(--m)", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 300 }}>{p.label}</span>
            </div>
            <div style={{ fontFamily: "var(--d)", fontWeight: 700, fontSize: "0.82rem", color: p.pick.color }}>{p.pick.logo} {p.pick.name}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", color: "var(--dim)" }}>{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tool card ────────────────────────────────────────────────────────────────
function ToolCard({ tool, lang, isWinner, proLabel, conLabel, animDelay }: {
  tool: ToolScore; lang: Lang; isWinner: boolean; proLabel: string; conLabel: string; animDelay: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--bg2)",
        border: `1px solid ${isWinner ? tool.color + "40" : hov ? tool.color + "22" : "var(--border)"}`,
        borderRadius: 16, padding: "1.75rem",
        display: "flex", flexDirection: "column" as const, gap: "1.25rem",
        position: "relative" as const, overflow: "hidden", flex: 1, minWidth: 260,
        transition: "all 0.25s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 16px 48px rgba(0,0,0,.4), 0 0 0 1px ${tool.color}18` : isWinner ? `0 0 0 1px ${tool.color}30` : "none",
        animation: `fadeUp 0.5s ease ${animDelay}ms both`,
      }}
    >
      {isWinner && <>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: tool.color, boxShadow: `0 0 24px ${tool.color}` }} />
        <div style={{ position: "absolute", top: "-25%", right: "-8%", width: 280, height: 200, background: `radial-gradient(ellipse,${tool.color}09,transparent 68%)`, pointerEvents: "none" }} />
      </>}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 46, height: 46, background: `${tool.color}18`, border: `2px solid ${tool.color}38`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", flexShrink: 0 }}>{tool.logo}</div>
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
        <div style={{ fontFamily: "var(--m)", fontSize: "0.67rem", color: tool.color, background: `${tool.color}12`, border: `1px solid ${tool.color}28`, borderRadius: 6, padding: "4px 10px", display: "inline-block", alignSelf: "flex-start" as const }}>{tool.badge[lang]}</div>
      )}

      {/* Scores */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.65rem" }}>
        {tool.scores.map((s, i) => (
          <div key={i}>
            <span style={{ fontFamily: "var(--m)", fontSize: "0.67rem", color: "var(--muted)", fontWeight: 300, display: "block", marginBottom: "0.2rem" }}>{s[lang]}</span>
            <ScoreBar value={s.value} color={tool.color} delay={i * 60} />
          </div>
        ))}
      </div>

      {/* Pros */}
      <div>
        <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#10b981", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span>✓</span> {proLabel}
        </div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "0.32rem" }}>
          {tool.pros[lang].map((p, i) => (
            <li key={i} style={{ fontFamily: "var(--m)", fontSize: "0.73rem", color: "var(--muted)", fontWeight: 300, display: "flex", gap: "0.5rem", lineHeight: 1.5 }}>
              <span style={{ color: "#10b981", flexShrink: 0 }}>+</span>{p}
            </li>
          ))}
        </ul>
      </div>

      {/* Cons */}
      <div>
        <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#ef4444", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span>✗</span> {conLabel}
        </div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "0.32rem" }}>
          {tool.cons[lang].map((c, i) => (
            <li key={i} style={{ fontFamily: "var(--m)", fontSize: "0.73rem", color: "var(--muted)", fontWeight: 300, display: "flex", gap: "0.5rem", lineHeight: 1.5 }}>
              <span style={{ color: "#ef4444", flexShrink: 0 }}>−</span>{c}
            </li>
          ))}
        </ul>
      </div>

      {/* Verdict */}
      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.8rem 1rem", fontFamily: "var(--m)", fontSize: "0.73rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300, fontStyle: "italic" }}>
        "{tool.verdict[lang]}"
      </div>

      {/* CTA */}
      {tool.affiliate && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.4rem", marginTop: "auto" }}>
          {isWinner && (
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.35rem", marginBottom: "0.25rem" }}>
              <span style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: tool.color, background: `${tool.color}10`, border: `1px solid ${tool.color}22`, borderRadius: 4, padding: "2px 7px" }}>✓ {lang === "fr" ? "Version gratuite" : "Free plan"}</span>
              <span style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: tool.color, background: `${tool.color}10`, border: `1px solid ${tool.color}22`, borderRadius: 4, padding: "2px 7px" }}>✓ {lang === "fr" ? "Sans carte" : "No card needed"}</span>
            </div>
          )}
          <a href={tool.affiliate} target="_blank" rel="noopener noreferrer sponsored"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", background: isWinner ? tool.color : "transparent", color: isWinner ? "#080c10" : tool.color, border: `1px solid ${tool.color}`, borderRadius: 9, padding: isWinner ? "12px 16px" : "10px 16px", fontFamily: "var(--d)", fontWeight: 800, fontSize: isWinner ? "0.88rem" : "0.82rem", textDecoration: "none", transition: "all 0.2s", boxShadow: isWinner ? `0 4px 18px ${tool.color}35` : "none" }}>
            {isWinner ? "🏆 " : ""}{lang === "fr" ? "Essayer" : "Try"} {tool.name} →
          </a>
          {isWinner && (
            <div style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: "var(--muted)", textAlign: "center" as const }}>{lang === "fr" ? "Accès immédiat · Sans engagement" : "Instant access · No commitment"}</div>
          )}
          <div style={{ fontFamily: "var(--m)", fontSize: "0.52rem", color: "var(--dim)", textAlign: "center" as const }}>{lang === "fr" ? "Lien affilié" : "Affiliate link"}</div>
        </div>
      )}
    </div>
  );
}

// ─── Winner CTA bloc ──────────────────────────────────────────────────────────
function WinnerCTA({ winner, lang }: { winner: ToolScore; lang: Lang }) {
  if (!winner.affiliate) return null;
  return (
    <div style={{ margin: "2.5rem 0", padding: "2.25rem 2.5rem", background: `linear-gradient(135deg,${winner.color}0a,${winner.color}02)`, border: `1px solid ${winner.color}35`, borderRadius: 18, position: "relative" as const, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${winner.color} 40%,${winner.color} 60%,transparent)` }} />
      <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: 500, height: 240, background: `radial-gradient(ellipse,${winner.color}07,transparent 68%)`, pointerEvents: "none" as const }} />
      <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: winner.color, marginBottom: "1.1rem", display: "flex", alignItems: "center", gap: "0.4rem", position: "relative" as const, zIndex: 1 }}>
        <span style={{ display: "inline-block", width: 14, height: 1, background: winner.color }} />
        {lang === "fr" ? "🏆 Notre recommandation" : "🏆 Our recommendation"}
        <span style={{ marginLeft: "0.35rem", color: "#f59e0b", fontSize: "0.78rem", letterSpacing: "1px" }}>★★★★★</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" as const, position: "relative" as const, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 220 }}>
          <div style={{ width: 56, height: 56, background: `${winner.color}18`, border: `2px solid ${winner.color}35`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>{winner.logo}</div>
          <div>
            <div style={{ fontFamily: "var(--d)", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "0.2rem" }}>
              {winner.name}<span style={{ fontFamily: "var(--m)", fontSize: "0.95rem", fontWeight: 800, color: winner.color, marginLeft: "0.55rem" }}>{winner.globalScore.toFixed(1)}/10</span>
            </div>
            <div style={{ fontFamily: "var(--m)", fontSize: "0.73rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.6, marginBottom: "0.65rem" }}>{winner.verdict[lang]}</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.4rem" }}>
              {[lang === "fr" ? "✓ Testé 3+ semaines" : "✓ Tested 3+ weeks", lang === "fr" ? "✓ Version gratuite" : "✓ Free plan", lang === "fr" ? "✓ Sans carte bancaire" : "✓ No credit card"].map((b, i) => (
                <span key={i} style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color: winner.color, background: `${winner.color}10`, border: `1px solid ${winner.color}22`, borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.55rem", alignItems: "stretch", flexShrink: 0, minWidth: 220 }}>
          <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: winner.color, color: "#080c10", fontFamily: "var(--d)", fontWeight: 800, fontSize: "1rem", padding: "15px 28px", borderRadius: 11, textDecoration: "none", whiteSpace: "nowrap" as const, boxShadow: `0 6px 24px ${winner.color}32`, transition: "all 0.2s" }}>
            🚀 {lang === "fr" ? "Commencer gratuitement" : "Start for free"} →
          </a>
          <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text)", fontFamily: "var(--d)", fontWeight: 700, fontSize: "0.88rem", padding: "12px 22px", borderRadius: 10, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.18s", whiteSpace: "nowrap" as const }}>
            {lang === "fr" ? "Voir les tarifs" : "View pricing"}
          </a>
          <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--muted)", fontFamily: "var(--m)", fontWeight: 400, fontSize: "0.7rem", padding: "4px", textDecoration: "none", transition: "color 0.18s" }}>
            {lang === "fr" ? `En savoir plus sur ${winner.name}` : `Learn more about ${winner.name}`} →
          </a>
          <div style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color: "var(--muted)", textAlign: "center" as const }}>{lang === "fr" ? "Accès immédiat · Sans engagement" : "Instant access · No commitment"}</div>
          <span style={{ fontFamily: "var(--m)", fontSize: "0.53rem", color: "var(--dim)", textAlign: "center" as const }}>{lang === "fr" ? "Liens affiliés — aucun coût supplémentaire" : "Affiliate links — no extra cost to you"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Related articles ─────────────────────────────────────────────────────────
function RelatedArticles({ toolNames, lang, l, L }: { toolNames: string[]; lang: Lang; l: (p: string) => string; L: Record<string,string> }) {
  const related = ARTICLES.filter(a => {
    const title = a[lang].title.toLowerCase();
    return toolNames.some(n => title.includes(n.toLowerCase())) || a.featured;
  }).slice(0, 3);
  if (!related.length) return null;
  const TAG_COLORS_LOCAL: Record<string, string> = { Chatbots: "#00e6be", Code: "#3b82f6", Rédaction: "#f59e0b", Writing: "#f59e0b", Image: "#a855f7", Productivité: "#10b981", Productivity: "#10b981", Audio: "#ef4444" };
  return (
    <div style={{ marginTop: "3rem", paddingTop: "2.5rem", borderTop: "1px solid var(--border)" }}>
      <div className="sec-tag">{L.relatedLabel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1rem" }}>
        {related.map(a => {
          const color = TAG_COLORS_LOCAL[a.tag] || "#00e6be";
          return (
            <a key={a.slug} href={l(`/blog/${a.slug}`)} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column" as const, gap: "0.6rem", textDecoration: "none", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}35`; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}>
              <span style={{ fontFamily: "var(--m)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color, background: `${color}18`, border: `1px solid ${color}28`, padding: "2px 8px", borderRadius: 100, display: "inline-block", alignSelf: "flex-start" as const }}>{a.tag}</span>
              <div style={{ fontFamily: "var(--d)", fontSize: "0.88rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>{a[lang].title}</div>
              <div style={{ fontFamily: "var(--m)", fontSize: "0.65rem", color: "var(--dim)" }}>⏱ {a.timeMin} min · {a.date[lang]}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── TOC ─────────────────────────────────────────────────────────────────────
function TableOfContents({ content, lang, L }: { content: string; lang: Lang; L: Record<string,string> }) {
  const [active, setActive] = useState("");
  const headings = content.match(/^## (.+)$/gm)?.map(h => ({ text: h.replace("## ", ""), id: slugify(h.replace("## ", "")) })) || [];
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-60px 0px -60% 0px" });
    headings.forEach(h => { const el = document.getElementById(h.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  if (!headings.length) return null;
  return (
    <div className="sbox">
      <div className="sbox-hd"><div className="sbox-title">📋 {L.toc}</div></div>
      <div className="sbox-bd" style={{ padding: "0.5rem 0" }}>
        {headings.map(h => (
          <a key={h.id} href={`#${h.id}`}
            style={{ display: "block", padding: "0.45rem 1.1rem", fontFamily: "var(--m)", fontSize: "0.68rem", fontWeight: active === h.id ? 600 : 300, color: active === h.id ? "var(--cyan)" : "var(--muted)", textDecoration: "none", borderLeft: `2px solid ${active === h.id ? "var(--cyan)" : "transparent"}`, transition: "all 0.15s", lineHeight: 1.4 }}>
            {h.text}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMd(md: string): string {
  let h = md.trim();
  h = h.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_, hd, body) => {
    const ths = hd.split("|").filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map((row: string) => "<tr>" + row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join("") + "</tr>").join("");
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
    const items = block.trim().split("\n").map(li => `<li>${li.replace(/^- /, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });
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
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = searchParams.get("tab");
    return (t === "details" || t === "analysis") ? t : "overview";
  });
  const [nlEmail, setNlEmail] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showNavCta, setShowNavCta] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [exitShown, setExitShown] = useState(false);
  const [showExit, setShowExit] = useState(false);

  useEffect(() => { setShareUrl(window.location.href); }, []);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 60);
      setShowNavCta(window.scrollY > 320);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Exit-intent (desktop)
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (e.clientY <= 8 && !exitShown) { setShowExit(true); setExitShown(true); }
    };
    document.addEventListener("mouseleave", fn);
    return () => document.removeEventListener("mouseleave", fn);
  }, [exitShown]);

  const changeTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  }, [pathname, router]);

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
    setTimeout(() => setCopied(false), 2200);
  };

  const data = getComparatifBySlug(slug);
  const comp = data ? data[lang] : null;

  const L = lang === "fr" ? {
    back: "← Comparatifs", share: copied ? "✓ Copié !" : "🔗 Copier le lien",
    winner: "🏆 Gagnant", pros: "Points forts", cons: "Points faibles",
    overview: "Vue d'ensemble", details: "Détails", analysis: "Analyse complète",
    verdict: "Notre verdict", nlText: "Le radar IA chaque lundi. Gratuit.",
    nlTitle: "Le radar IA · chaque lundi",
    sub: "Je m'abonne", subLoading: "...", subDone: "✓ À lundi !", subError: "Erreur, réessayez.",
    placeholder: "votre@email.com",
    radar: "Radar des scores", compare: "Comparatif côte à côte", methodology: "Analyse complète",
    scores: "Scores", pricingLabel: "Tarif", criteria: "Critère", detailed: "Tableau des scores",
    contact: "Contact", ourPick: "🏆 Gagnant", affLink: "Lien affilié",
    tools: "outils", tool: "Outil", score: "Score", readTime: "min de lecture",
    toc: "Sommaire", bestFor: "🎯 Qui choisir ?", relatedLabel: "Articles liés",
    quickCompare: "Comparaison rapide",
    navCta: "Essayer", exitTitle: "Avant de partir...",
    exitDesc: "Ce comparatif prend du temps. Sauvegardez-le pour y revenir.",
    exitCta: "Continuer la lecture",
    exitNl: "Recevoir nos analyses par email",
    newBadge: "Nouveau",
  } : {
    back: "← Comparisons", share: copied ? "✓ Copied!" : "🔗 Copy link",
    winner: "🏆 Winner", pros: "Strengths", cons: "Weaknesses",
    overview: "Overview", details: "Details", analysis: "Full analysis",
    verdict: "Our verdict", nlText: "The AI radar every Monday. Free.",
    nlTitle: "The AI Radar · every Monday",
    sub: "Subscribe", subLoading: "...", subDone: "✓ See you Monday!", subError: "Error, try again.",
    placeholder: "your@email.com",
    radar: "Score radar", compare: "Side by side", methodology: "Full analysis",
    scores: "Scores", pricingLabel: "Price", criteria: "Criteria", detailed: "Score table",
    contact: "Contact", ourPick: "🏆 Winner", affLink: "Affiliate link",
    tools: "tools", tool: "Tool", score: "Score", readTime: "min read",
    toc: "Contents", bestFor: "🎯 Who should choose what?", relatedLabel: "Related articles",
    quickCompare: "Quick comparison",
    navCta: "Try it", exitTitle: "Before you leave...",
    exitDesc: "This comparison took weeks to write. Save it to come back later.",
    exitCta: "Keep reading",
    exitNl: "Get our analysis by email",
    newBadge: "New",
  };

  if (!data || !comp) {
    return (
      <>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}:root{--bg:#080c10;--cyan:#00e6be;--text:#edf2f7;--muted:#5a6a7a;--d:'Syne',sans-serif;--m:'JetBrains Mono',monospace}body{background:var(--bg);color:var(--text);font-family:var(--d);display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.nf h1{font-size:3rem;font-weight:800;margin-bottom:1rem}.nf p{font-family:var(--m);color:var(--muted);margin-bottom:2rem;font-size:.85rem}.btn{background:var(--cyan);color:var(--bg);font-family:var(--d);font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-flex}`}</style>
        <div className="nf"><h1>404</h1><p>{lang === "fr" ? "Ce comparatif n'existe pas." : "This comparison doesn't exist."}</p><a href={l("/comparatifs")} className="btn">{L.back}</a></div>
      </>
    );
  }

  const winner = data.tools.find(t => t.name === data.winner);
  const tagColor = TAG_COLORS[data.tag] || "#00e6be";
  const criteriaLabels = data.criteria[lang];
  const compUrl = `https://neuriflux.com/${lang}/comparatifs/${slug}`;
  const estRead = readTime(comp.content);
  const _new = isNew(data.date.en);

  // ── Schemas JSON-LD ──────────────────────────────────────────────────────────
  const articleSchema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: comp.title, description: comp.intro,
    image: `https://neuriflux.com/og/${slug}.png`,
    author: { "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com" },
    publisher: { "@type": "Organization", name: "Neuriflux", logo: { "@type": "ImageObject", url: "https://neuriflux.com/logo.png", width: 200, height: 60 } },
    datePublished: data.date.en, dateModified: data.date.en,
    url: compUrl, inLanguage: lang,
    timeRequired: `PT${estRead}M`,
    mainEntityOfPage: { "@type": "WebPage", "@id": compUrl },
    about: data.tools.map(t => ({ "@type": "SoftwareApplication", name: t.name, applicationCategory: "WebApplication", offers: { "@type": "Offer", price: t.price, priceCurrency: "USD" } })),
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
    itemListElement: [...data.tools].sort((a, b) => b.globalScore - a.globalScore).map((t, i) => ({
      "@type": "ListItem", position: i + 1, name: t.name, url: t.affiliate || compUrl,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      ...data.tools.slice(0, 3).map(t => ({
        "@type": "Question",
        name: lang === "fr" ? `${t.name} vaut-il le coup en 2026 ?` : `Is ${t.name} worth it in 2026?`,
        acceptedAnswer: { "@type": "Answer", text: t.verdict[lang] },
      })),
      {
        "@type": "Question",
        name: lang === "fr" ? `Quel est le meilleur outil entre ${data.tools.map(t => t.name).join(", ")} ?` : `Which is best among ${data.tools.map(t => t.name).join(", ")}?`,
        acceptedAnswer: { "@type": "Answer", text: lang === "fr" ? `D'après nos tests, ${data.winner} est le meilleur avec ${winner?.globalScore.toFixed(1)}/10. ${comp.verdict}` : `Based on our tests, ${data.winner} is the best with ${winner?.globalScore.toFixed(1)}/10. ${comp.verdict}` },
      },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org", "@type": "Product",
    name: winner?.name,
    description: winner?.verdict[lang],
    brand: { "@type": "Brand", name: winner?.name },
    aggregateRating: { "@type": "AggregateRating", ratingValue: winner?.globalScore.toFixed(1), bestRating: "10", worstRating: "0", ratingCount: "1" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {winner?.affiliate && <link rel="preconnect" href={(() => { try { return new URL(winner.affiliate).origin; } catch { return ""; } })()} />}

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,.065);--glow:rgba(0,230,190,.2);
          --cyan:#00e6be;--cdim:rgba(0,230,190,.09);
          --text:#edf2f7;--muted:#5a6a7a;--dim:#2a3a4a;
          --d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;
          --body:Georgia,'Times New Roman',serif;
          --pad:clamp(1.25rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.016) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}

        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes radarIn{from{opacity:0}to{opacity:1}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
        @keyframes exitIn{from{opacity:0;transform:scale(.96) translateY(-8px)}to{opacity:1;transform:none}}

        /* ── NAV ── */
        nav{position:sticky;top:0;z-index:200;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(8,12,16,.95);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .25s}
        nav.scrolled{box-shadow:0 4px 28px rgba(0,0,0,.5)}
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

        /* Nav CTA */
        .nav-cta{display:flex;align-items:center;gap:.4rem;font-family:var(--d);font-weight:700;font-size:.75rem;padding:6px 14px;border-radius:7px;text-decoration:none;transition:all .18s;animation:slideDown .3s ease;white-space:nowrap}
        .nav-cta:hover{transform:translateY(-1px);filter:brightness(1.12)}
        @media(max-width:600px){.nav-cta-text{display:none}}

        /* ── LAYOUT ── */
        .layout{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:3.5rem var(--pad) 7rem;display:grid;grid-template-columns:1fr 288px;gap:4.5rem;align-items:start}
        @media(max-width:980px){.layout{grid-template-columns:1fr;gap:0}.sidebar{display:none!important}}

        /* ── HEADER ── */
        .back{display:inline-flex;align-items:center;gap:.35rem;font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;margin-bottom:2rem;transition:color .15s;letter-spacing:.03em}
        .back:hover{color:var(--cyan)}
        .art-meta{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:1rem}
        .tag-b{font-family:var(--m);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:3px 10px;border-radius:100px}
        .art-title{font-size:clamp(1.75rem,4vw,2.7rem);font-weight:800;letter-spacing:-.035em;line-height:1.1;margin-bottom:.5rem;color:var(--text)}
        .read-time{font-family:var(--m);font-size:.68rem;color:var(--dim);display:flex;align-items:center;gap:.4rem;margin-bottom:1rem}
        .art-desc{font-family:var(--m);font-size:.83rem;color:var(--muted);font-weight:300;line-height:1.75;padding:1rem 1.4rem;border-radius:0 8px 8px 0;margin-bottom:2rem}

        /* ── WINNER BANNER ── */
        .winner-banner{border-radius:12px;padding:1.3rem 1.6rem;display:flex;align-items:center;gap:1rem;margin-bottom:2rem;flex-wrap:wrap;position:relative;overflow:hidden}
        .winner-score{font-family:var(--d);font-size:2.1rem;font-weight:800;letter-spacing:-.04em;line-height:1}

        /* ── TABS ── */
        .tabs{display:flex;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:2rem;background:var(--bg2)}
        .tab{flex:1;font-family:var(--m);font-size:.72rem;padding:11px 16px;background:transparent;border:none;color:var(--muted);cursor:pointer;transition:all .18s;letter-spacing:.04em;text-align:center}
        .tab:not(:last-child){border-right:1px solid var(--border)}
        .tab:hover{background:var(--bg3);color:var(--text)}
        .tab.active{background:var(--cyan);color:#080c10;font-weight:700}

        /* ── SECTIONS ── */
        .sec-tag{font-family:var(--m);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.4rem}
        .sec-tag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}
        .tools-grid{display:flex;gap:1.25rem;flex-wrap:wrap;margin-bottom:2.5rem}
        .radar-section{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:2rem;margin-bottom:2.5rem}
        .radar-wrap{display:flex;flex-direction:column;align-items:center;gap:1.5rem}
        .radar-legend{display:flex;gap:1.25rem;flex-wrap:wrap;justify-content:center}
        .radar-legend-item{display:flex;align-items:center;gap:.4rem;font-family:var(--m);font-size:.68rem;color:var(--muted)}
        .radar-legend-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}

        /* ── VERDICT ── */
        .verdict-box{background:var(--bg2);border:1px solid rgba(0,230,190,.18);border-radius:16px;padding:2rem 2.25rem;margin-bottom:2.5rem;position:relative;overflow:hidden}
        .verdict-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .verdict-glow{position:absolute;top:-35%;left:50%;transform:translateX(-50%);width:400px;height:200px;background:radial-gradient(ellipse,rgba(0,230,190,.055),transparent 70%);pointer-events:none}
        .verdict-text{font-family:var(--m);font-size:.85rem;color:var(--muted);line-height:1.75;font-weight:300;position:relative;z-index:1}

        /* ── PROSE ── */
        .prose{font-family:var(--body);font-size:1.01rem;line-height:1.88;color:#c8d5e0}
        .prose h2{font-family:var(--d);font-size:1.35rem;font-weight:800;letter-spacing:-.025em;color:var(--text);margin:2.75rem 0 0;padding:.6rem 0 .6rem 1rem;border-left:3px solid var(--cyan);border-bottom:1px solid var(--border);scroll-margin-top:80px}
        .prose h2+*{margin-top:.85rem}
        .prose h3{font-family:var(--d);font-size:1.05rem;font-weight:700;color:var(--text);margin:2rem 0 .7rem;scroll-margin-top:80px}
        .prose p{margin-bottom:1.25rem}
        .prose strong{color:var(--text);font-weight:600;font-family:var(--d)}
        .prose em{color:var(--muted);font-style:italic}
        .prose ul,.prose ol{padding-left:1.4rem;margin:.65rem 0 1.2rem}
        .prose li{margin-bottom:.45rem;color:#c8d5e0;line-height:1.65}
        .prose li::marker{color:var(--cyan);font-weight:700}
        .prose a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(0,230,190,.28);transition:border-color .15s}
        .prose a:hover{border-color:var(--cyan)}
        .prose code{font-family:var(--m);font-size:.79rem;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--cyan)}
        .prose pre{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:1.25rem 1.5rem;margin:1.5rem 0;overflow-x:auto}
        .prose pre code{background:none;border:none;padding:0;color:#a8c0d6;font-size:.79rem;line-height:1.75}
        .prose table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-family:var(--m);font-size:.75rem}
        .prose th{padding:10px 14px;border:1px solid var(--border);color:var(--text);font-weight:600;background:var(--bg3);text-align:left}
        .prose td{padding:10px 14px;border:1px solid var(--border);color:var(--muted)}
        .prose tr:hover td{background:var(--bg2)}

        /* ── SHARE ── */
        .share{display:flex;align-items:center;gap:.55rem;margin-top:3rem;padding:1.25rem 1.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:12px;flex-wrap:wrap}
        .share-label{font-family:var(--m);font-size:.62rem;color:var(--dim);letter-spacing:.09em;text-transform:uppercase;margin-right:.25rem}
        .sbtn{font-family:var(--m);font-size:.7rem;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;text-decoration:none;display:inline-flex;align-items:center;gap:.35rem}
        .sbtn:hover{border-color:rgba(0,230,190,.28);color:var(--cyan);background:var(--cdim)}
        .sbtn.done{background:var(--cdim);border-color:rgba(0,230,190,.28);color:var(--cyan)}

        /* ── SIDEBAR ── */
        .sidebar{position:sticky;top:76px;display:flex;flex-direction:column;gap:.8rem}
        .sbox{background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden}
        .sbox-hd{padding:.8rem 1.1rem;border-bottom:1px solid var(--border)}
        .sbox-title{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
        .sbox-bd{padding:.85rem 1.1rem}
        .score-row{display:flex;align-items:center;justify-content:space-between;padding:.48rem 0;border-bottom:1px solid var(--border)}
        .score-row:last-child{border-bottom:none}
        .score-row.hovered{background:rgba(255,255,255,.02)}

        /* Sidebar winner */
        .sbox-win{position:relative;overflow:hidden}
        .sbox-win::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--wc,var(--cyan)) 30%,var(--wc,var(--cyan)) 70%,transparent)}
        .win-checks{display:flex;flex-direction:column;gap:.22rem;margin:.55rem 0 .85rem}
        .win-check{font-family:var(--m);font-size:.62rem;color:var(--wc,var(--cyan));font-weight:500}
        .win-btn{display:flex;align-items:center;justify-content:center;gap:.4rem;width:100%;font-family:var(--d);font-weight:800;font-size:.82rem;padding:12px;border-radius:8px;text-decoration:none;transition:all .2s;letter-spacing:-.01em;margin-bottom:.45rem}
        .win-btn-p:hover{transform:translateY(-2px);filter:brightness(1.1)}
        .win-btn-o{background:transparent!important;border:1px solid;font-weight:700;font-size:.78rem;padding:9px}
        .win-btn-o:hover{transform:translateY(-1px)}
        .win-btn-ghost{display:flex;align-items:center;justify-content:center;font-family:var(--m);font-size:.65rem;color:var(--muted);text-decoration:none;padding:3px;transition:color .15s}
        .win-btn-ghost:hover{color:var(--cyan)}
        .aff-note{font-family:var(--m);font-size:.52rem;color:var(--dim);text-align:center;margin-top:.35rem}

        /* Newsletter */
        .nl-title-s{font-family:var(--d);font-size:.83rem;font-weight:700;color:var(--text);letter-spacing:-.02em;margin-bottom:.3rem}
        .nl-text{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.65;font-weight:300;margin-bottom:.85rem}
        .nl-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 11px;color:var(--text);font-family:var(--m);font-size:.74rem;outline:none;margin-bottom:.45rem;transition:border-color .18s}
        .nl-input:focus{border-color:rgba(0,230,190,.3)}
        .nl-input::placeholder{color:var(--dim)}
        .nl-btn{width:100%;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.76rem;padding:9px;border-radius:6px;border:none;cursor:pointer;transition:opacity .18s}
        .nl-btn:hover{opacity:.9}
        .nl-btn:disabled{opacity:.55;cursor:not-allowed}
        .nl-status{text-align:center;font-family:var(--m);font-size:.74rem;padding:6px 0}

        /* ── STICKY MOBILE CTA ── */
        .sticky-win{display:none}
        @media(max-width:980px){
          .sticky-win{display:flex;align-items:center;justify-content:space-between;gap:.75rem;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(8,12,16,.97);border-top:1px solid rgba(0,230,190,.2);padding:.9rem var(--pad);backdrop-filter:blur(20px)}
          .sticky-win-info{display:flex;flex-direction:column;gap:.15rem}
          .sticky-win-name{font-family:var(--d);font-size:.85rem;font-weight:800;color:var(--text);letter-spacing:-.01em}
          .sticky-win-sub{font-family:var(--m);font-size:.6rem;color:var(--muted)}
          .sticky-win-btn{display:inline-flex;align-items:center;gap:.35rem;font-family:var(--d);font-weight:800;font-size:.82rem;padding:10px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0;transition:all .18s}
        }

        /* ── EXIT INTENT ── */
        .exit-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:500;display:flex;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(4px)}
        .exit-modal{background:var(--bg2);border:1px solid rgba(0,230,190,.25);border-radius:20px;padding:2.5rem;max-width:460px;width:100%;position:relative;animation:exitIn .3s ease;box-shadow:0 32px 80px rgba(0,0,0,.7)}
        .exit-close{position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--dim);cursor:pointer;font-size:1.1rem;padding:4px;transition:color .15s}
        .exit-close:hover{color:var(--muted)}

        /* ── FOOTER ── */
        .comp-footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:1.75rem var(--pad);max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
        .ft-links{display:flex;gap:1.25rem;list-style:none}
        .ft-links a{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none;transition:color .15s}
        .ft-links a:hover{color:var(--muted)}

        /* ── DETAIL TABLE ── */
        .detail-table th,.detail-table td{padding:10px 16px;border:1px solid var(--border)}
        .detail-table th{background:var(--bg3);color:var(--dim);font-weight:400;font-size:.6rem;letter-spacing:.06em;text-transform:uppercase}
        .detail-table tr:hover td{background:var(--bg2)}
      `}</style>

      <ProgressBar color={tagColor} />
      <div className="bg-grid" />

      {/* ── EXIT INTENT MODAL ── */}
      {showExit && winner?.affiliate && (
        <div className="exit-overlay" onClick={() => setShowExit(false)}>
          <div className="exit-modal" onClick={e => e.stopPropagation()}>
            <button className="exit-close" onClick={() => setShowExit(false)}>✕</button>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⏸</div>
            <div style={{ fontFamily: "var(--d)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem", letterSpacing: "-.02em" }}>{L.exitTitle}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "1.5rem" }}>{L.exitDesc}</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.6rem" }}>
              <button onClick={() => setShowExit(false)} style={{ background: tagColor, color: "#080c10", border: "none", borderRadius: 10, padding: "12px", fontFamily: "var(--d)", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer" }}>{L.exitCta}</button>
              <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored" onClick={() => setShowExit(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: tagColor, border: `1px solid ${tagColor}40`, borderRadius: 10, padding: "11px", fontFamily: "var(--d)", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>🚀 {lang === "fr" ? `Essayer ${winner.name} →` : `Try ${winner.name} →`}</a>
              <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", color: "var(--dim)", textAlign: "center" as const }}>{lang === "fr" ? "Lien affilié — aucun coût" : "Affiliate link — no extra cost"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>Blog</a></li>
          <li><a href={l("/comparatifs")} className="active">{lang === "fr" ? "Comparatifs" : "Comparisons"}</a></li>
          <li><a href={l("/newsletter")}>Newsletter</a></li>
          <li><a href={l("/contact")}>{L.contact}</a></li>
          <li><a href={l("/about")}>{lang === "fr" ? "À propos" : "About"}</a></li>
        </ul>
        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
          {/* Nav CTA au scroll */}
          {showNavCta && winner?.affiliate && (
            <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
              className="nav-cta"
              style={{ background: tagColor, color: "#080c10", boxShadow: `0 3px 14px ${tagColor}30` }}>
              {winner.logo} <span className="nav-cta-text">{L.navCta} {winner.name}</span> →
            </a>
          )}
          <div className="lt">
            <button className={`lb${lang === "fr" ? " on" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " on" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>

      <div className="layout">
        <main>
          {/* Breadcrumb nav */}
          <nav aria-label="breadcrumb" style={{ marginBottom: "2rem" }}>
            <ol style={{ display: "flex", alignItems: "center", gap: ".4rem", listStyle: "none", fontFamily: "var(--m)", fontSize: ".68rem", color: "var(--dim)", flexWrap: "wrap" as const }}>
              <li><a href={l("")} style={{ color: "var(--dim)", textDecoration: "none" }}>Neuriflux</a></li>
              <li style={{ color: "var(--dim)" }}>›</li>
              <li><a href={l("/comparatifs")} style={{ color: "var(--dim)", textDecoration: "none" }}>{lang === "fr" ? "Comparatifs" : "Comparisons"}</a></li>
              <li style={{ color: "var(--dim)" }}>›</li>
              <li style={{ color: "var(--muted)" }}>{comp.title}</li>
            </ol>
          </nav>

          <div className="art-meta">
            <span className="tag-b" style={{ color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}35` }}>{data.tag}</span>
            {_new && <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", color: "#10b981", background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", padding: "3px 8px", borderRadius: 100, fontWeight: 600 }}>✦ {L.newBadge}</span>}
            <span style={{ fontFamily: "var(--m)", fontSize: "0.68rem", color: "var(--muted)" }}>{data.date[lang]}</span>
            <span style={{ fontFamily: "var(--m)", fontSize: "0.68rem", color: "var(--dim)" }}>⚔️ {data.tools.length} {L.tools}</span>
          </div>

          <h1 className="art-title">{comp.title}</h1>
          <div className="read-time">⏱ {estRead} {L.readTime} · {lang === "fr" ? "Dernière mise à jour" : "Last updated"} {data.date[lang]}</div>

          <p className="art-desc" style={{ borderLeft: `2px solid ${tagColor}` }}>{comp.intro}</p>

          {/* Quick compare table */}
          <QuickCompare tools={data.tools} lang={lang} l={l} L={L} />

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

          {/* Tabs — avec état dans l'URL */}
          <div className="tabs">
            {(["overview", "details", "analysis"] as Tab[]).map(tab => (
              <button key={tab} className={`tab${activeTab === tab ? " active" : ""}`} onClick={() => changeTab(tab)}>
                {tab === "overview" ? L.overview : tab === "details" ? L.details : L.analysis}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div>
              {/* Radar */}
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

              {/* Detailed score table */}
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: "2.5rem" }}>
                <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                  <div className="sec-tag" style={{ marginBottom: 0 }}>{L.detailed}</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="detail-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--m)", fontSize: "0.75rem" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" as const }}>{L.criteria}</th>
                        {data.tools.map(tool => <th key={tool.name} style={{ textAlign: "center" as const, color: tool.color }}>{tool.logo} {tool.name}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {criteriaLabels.map((criterion, ci) => (
                        <tr key={criterion}>
                          <td style={{ color: "var(--muted)", fontWeight: 300 }}>{criterion}</td>
                          {data.tools.map(tool => {
                            const score = tool.scores[ci]?.value || 0;
                            const sc = score >= 9 ? "#00e6be" : score >= 7.5 ? "#3b82f6" : score >= 6 ? "#f59e0b" : "#ef4444";
                            const best = Math.max(...data.tools.map(t => t.scores[ci]?.value || 0));
                            return (
                              <td key={tool.name} style={{ textAlign: "center" as const }}>
                                <span style={{ fontWeight: score === best ? 700 : 400, color: score === best ? sc : "var(--muted)", background: score === best ? `${sc}15` : "transparent", padding: "2px 8px", borderRadius: 4, display: "inline-block" }}>
                                  {score.toFixed(1)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid var(--border)", background: "var(--bg3)" }}>
                        <td style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>GLOBAL</td>
                        {data.tools.map(tool => {
                          const best = Math.max(...data.tools.map(t => t.globalScore));
                          return (
                            <td key={tool.name} style={{ textAlign: "center" as const }}>
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

              {/* Best For */}
              <BestForSection tools={data.tools} lang={lang} L={L} />

              {/* Verdict */}
              <div className="verdict-box">
                <div className="verdict-glow" />
                <div className="sec-tag">{L.verdict}</div>
                <p className="verdict-text">{comp.verdict}</p>
                {winner?.affiliate && (
                  <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: `1px solid ${winner.color}20`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "1rem", position: "relative", zIndex: 1 }}>
                    <div>
                      <div style={{ fontFamily: "var(--d)", fontSize: "0.88rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.2rem" }}>
                        {lang === "fr" ? `Notre verdict : ${winner.name} s'impose.` : `Our verdict: ${winner.name} wins.`}
                      </div>
                      <div style={{ fontFamily: "var(--m)", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 300 }}>
                        {lang === "fr" ? "Version gratuite disponible · Sans carte bancaire" : "Free plan available · No credit card needed"}
                      </div>
                    </div>
                    <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: winner.color, color: "#080c10", fontFamily: "var(--d)", fontWeight: 800, fontSize: "0.85rem", padding: "10px 22px", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap" as const, boxShadow: `0 4px 16px ${winner.color}30`, flexShrink: 0 }}>
                      {lang === "fr" ? "Essayer gratuitement" : "Try for free"} →
                    </a>
                  </div>
                )}
              </div>

              {winner && <WinnerCTA winner={winner} lang={lang} />}
              <RelatedArticles toolNames={data.tools.map(t => t.name)} lang={lang} l={l} L={L} />
            </div>
          )}

          {/* ── DETAILS ── */}
          {activeTab === "details" && (
            <div>
              <div className="sec-tag" style={{ marginBottom: "1.5rem" }}>{L.compare}</div>
              <div className="tools-grid">
                {data.tools.map((tool, i) => (
                  <ToolCard key={tool.name} tool={tool} lang={lang}
                    isWinner={tool.name === data.winner}
                    proLabel={L.pros} conLabel={L.cons}
                    animDelay={i * 90} />
                ))}
              </div>

              {/* Editor's choice banner */}
              {winner?.affiliate && (
                <div style={{ margin: "1.75rem 0", padding: "1.35rem 1.75rem", background: `linear-gradient(135deg,${winner.color}0c,${winner.color}03)`, border: `1px solid ${winner.color}28`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "1.25rem", position: "relative" as const, overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${winner.color},transparent)` }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 200 }}>
                    <span style={{ fontSize: "1.5rem" }}>{winner.logo}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                        <span style={{ fontFamily: "var(--m)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: winner.color }}>{lang === "fr" ? "Choix de l'éditeur" : "Editor's choice"}</span>
                        <span style={{ color: "#f59e0b", fontSize: "0.65rem", letterSpacing: "1px" }}>★★★★★</span>
                      </div>
                      <div style={{ fontFamily: "var(--d)", fontSize: "0.95rem", fontWeight: 800, color: "var(--text)" }}>{winner.name}</div>
                      <div style={{ fontFamily: "var(--m)", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 300 }}>
                        {lang === "fr" ? `Score global : ${winner.globalScore.toFixed(1)}/10 · Version gratuite` : `Overall score: ${winner.globalScore.toFixed(1)}/10 · Free plan`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
                    <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: winner.color, color: "#080c10", fontFamily: "var(--d)", fontWeight: 800, fontSize: "0.88rem", padding: "11px 24px", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap" as const, boxShadow: `0 4px 16px ${winner.color}30` }}>
                      {lang === "fr" ? "Commencer gratuit" : "Start for free"} →
                    </a>
                    <div style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: "var(--dim)", textAlign: "center" as const }}>{lang === "fr" ? "Lien affilié" : "Affiliate link"}</div>
                  </div>
                </div>
              )}

              {winner && <WinnerCTA winner={winner} lang={lang} />}
              <RelatedArticles toolNames={data.tools.map(t => t.name)} lang={lang} l={l} L={L} />
            </div>
          )}

          {/* ── ANALYSIS ── */}
          {activeTab === "analysis" && (
            <div>
              <div className="sec-tag" style={{ marginBottom: "1.5rem" }}>{L.methodology}</div>
              <div className="prose" dangerouslySetInnerHTML={{ __html: renderMd(comp.content) }} />
              {winner && <WinnerCTA winner={winner} lang={lang} />}
              <RelatedArticles toolNames={data.tools.map(t => t.name)} lang={lang} l={l} L={L} />
            </div>
          )}

          {/* Share */}
          <div className="share">
            <span className="share-label">{lang === "fr" ? "Partager" : "Share"}</span>
            <button className={`sbtn${copied ? " done" : ""}`} onClick={copy}>{L.share}</button>
            <a className="sbtn" href={shareUrl ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(comp.title)}&url=${encodeURIComponent(shareUrl)}&via=NeurifluxCom` : "#"} target="_blank" rel="noopener noreferrer">𝕏 Twitter</a>
            <a className="sbtn" href={shareUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` : "#"} target="_blank" rel="noopener noreferrer">in LinkedIn</a>
            <a className="sbtn" href={shareUrl ? `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(comp.title)}` : "#"} target="_blank" rel="noopener noreferrer">r/ Reddit</a>
          </div>
        </main>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">

          {/* TOC */}
          {activeTab === "analysis" && <TableOfContents content={comp.content} lang={lang} L={L} />}

          {/* Scores avec highlight au hover des cards */}
          <div className="sbox">
            <div className="sbox-hd"><div className="sbox-title">{L.scores}</div></div>
            <div className="sbox-bd">
              {[...data.tools].sort((a, b) => b.globalScore - a.globalScore).map(tool => (
                <div key={tool.name} className={`score-row${hoveredTool === tool.name ? " hovered" : ""}`}
                  onMouseEnter={() => setHoveredTool(tool.name)}
                  onMouseLeave={() => setHoveredTool(null)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.9rem", transition: "transform .15s", transform: hoveredTool === tool.name ? "scale(1.2)" : "none" }}>{tool.logo}</span>
                    <span style={{ fontFamily: "var(--m)", fontSize: "0.72rem", color: tool.name === data.winner ? "var(--text)" : "var(--muted)", fontWeight: tool.name === data.winner ? 600 : 300, transition: "color .15s" }}>
                      {tool.name}
                    </span>
                    {tool.name === data.winner && <span style={{ fontSize: "0.6rem" }}>🏆</span>}
                  </div>
                  <span style={{ fontFamily: "var(--m)", fontSize: "0.78rem", fontWeight: 700, color: hoveredTool === tool.name ? tool.color : "var(--muted)", transition: "color .15s" }}>
                    {tool.globalScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar winner — haute conversion */}
          {winner?.affiliate && (
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
                <div className="win-checks">
                  <span className="win-check">✓ {lang === "fr" ? "Testé par Neuriflux" : "Tested by Neuriflux"}</span>
                  <span className="win-check">✓ {lang === "fr" ? "Version gratuite dispo" : "Free plan available"}</span>
                  <span className="win-check">✓ {lang === "fr" ? "Sans carte bancaire" : "No credit card"}</span>
                </div>
                <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
                  className="win-btn win-btn-p" style={{ background: winner.color, color: "#080c10", boxShadow: `0 4px 16px ${winner.color}28` }}>
                  🚀 {lang === "fr" ? "Commencer gratuitement" : "Start for free"} →
                </a>
                <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
                  className="win-btn win-btn-o" style={{ color: winner.color, borderColor: `${winner.color}40` }}>
                  {lang === "fr" ? "Voir les tarifs" : "View pricing"}
                </a>
                <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored" className="win-btn-ghost">
                  {lang === "fr" ? "En savoir plus →" : "Learn more →"}
                </a>
                <div style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: "var(--muted)", textAlign: "center" as const, marginTop: ".4rem" }}>{lang === "fr" ? "Accès immédiat · Sans carte" : "Instant access · No card"}</div>
                <div className="aff-note">{L.affLink}</div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="sbox">
            <div className="sbox-hd"><div className="sbox-title">{lang === "fr" ? "Tarifs" : "Pricing"}</div></div>
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

          {/* Autres comparatifs */}
          <div className="sbox">
            <div className="sbox-hd"><div className="sbox-title">{lang === "fr" ? "Autres comparatifs" : "More comparisons"}</div></div>
            <div className="sbox-bd" style={{ display: "flex", flexDirection: "column" as const, gap: "0.5rem" }}>
              {COMPARATIFS.filter(c => c.slug !== slug).slice(0, 4).map(c => {
                const color = TAG_COLORS[c.tag] || "#00e6be";
                return (
                  <a key={c.slug} href={l(`/comparatifs/${c.slug}`)}
                    style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border)", textDecoration: "none", transition: "opacity .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = ".75"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = "1"}>
                    <span style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color, background: `${color}15`, border: `1px solid ${color}25`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{c.tag}</span>
                    <span style={{ fontFamily: "var(--m)", fontSize: "0.7rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.3 }}>{c[lang].title}</span>
                  </a>
                );
              })}
              <a href={l("/comparatifs")} style={{ fontFamily: "var(--m)", fontSize: "0.68rem", color: "var(--cyan)", textDecoration: "none", display: "flex", alignItems: "center", gap: ".3rem", paddingTop: "0.4rem" }}>
                {lang === "fr" ? "Tous les comparatifs →" : "All comparisons →"}
              </a>
            </div>
          </div>

        </aside>
      </div>

      {/* ── STICKY MOBILE CTA ── */}
      {winner?.affiliate && (
        <div className="sticky-win">
          <div className="sticky-win-info">
            <div className="sticky-win-name">🏆 {winner.name}</div>
            <div className="sticky-win-sub">{lang === "fr" ? "Version gratuite disponible" : "Free plan available"}</div>
          </div>
          <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
            className="sticky-win-btn"
            style={{ background: tagColor, color: "#080c10", boxShadow: `0 4px 16px ${tagColor}30` }}>
            {lang === "fr" ? "Essayer gratuit" : "Try free"} →
          </a>
        </div>
      )}

      <footer className="comp-footer">
        <span className="ft-copy">© 2026 <em>Neuriflux</em>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</span>
        <ul className="ft-links">
          <li><a href={l("/comparatifs")}>{lang === "fr" ? "Comparatifs" : "Comparisons"}</a></li>
          <li><a href={l("/blog")}>Blog</a></li>
          <li><a href={l("/newsletter")}>Newsletter</a></li>
          <li><a href={l("/about")}>{lang === "fr" ? "À propos" : "About"}</a></li>
        </ul>
        <span className="ft-copy">{lang === "fr" ? "Fait avec ♥ en France" : "Made with ♥ in France"}</span>
      </footer>
    </>
  );
}