"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNewsletter } from "@/lib/useNewsletter";

type Lang = "fr" | "en";

// ─── Traductions ───────────────────────────────────────────────────────────────
const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    seo: {
      title: "Le Radar IA — Newsletter IA gratuite chaque lundi | Neuriflux",
      description: "Rejoignez 3 200+ professionnels qui reçoivent chaque lundi les meilleurs outils IA, comparatifs honnêtes et deals à ne pas rater. Gratuit, sans spam.",
    },
    badge: "Gratuit · Sans spam · Chaque lundi",
    title: "Le Radar IA",
    titleAccent: "de la semaine.",
    subtitle: "Chaque lundi matin, 3 200+ professionnels reçoivent les outils IA qui comptent vraiment, les comparatifs honnêtes, et les deals à ne pas rater.",
    placeholder: "votre@email.com",
    cta: "Je m'abonne gratuitement",
    ctaLoading: "Inscription...",
    ctaSub: "Rejoindre le Radar →",
    privacy: "Pas de spam · Désabonnement en 1 clic · Données privées",
    social: "3 200+",
    socialLabel: "professionnels abonnés",
    socialSub: "Marketeurs, devs, créateurs — chaque lundi",
    mockupLabel: "Aperçu de la dernière édition",
    mockupDate: "Lundi 24 mars 2026",
    mockupSubject: "🔬 Cursor bat GitHub Copilot (test complet) + deals IA de la semaine",
    mockupItems: [
      { tag: "OUTIL", color: "#00e6be", text: "Cursor vs Copilot vs Codeium — notre test sur 3 semaines" },
      { tag: "DEAL", color: "#f59e0b", text: "ElevenLabs : -40% sur l'annuel jusqu'à dimanche" },
      { tag: "RADAR", color: "#a855f7", text: "GPT-4o vision API : ce qui change pour les devs" },
    ],
    success: {
      title: "Bienvenue dans le Radar ! 🎉",
      text: "Votre prochain email arrive lundi. En attendant, explorez nos comparatifs IA.",
      cta: "Voir les comparatifs →",
    },
    error: "Une erreur s'est produite. Réessayez ou contactez-nous.",
    proofs: [
      { stat: "3 200+", label: "Abonnés actifs" },
      { stat: "52", label: "Éditions publiées" },
      { stat: "100%", label: "Gratuit, toujours" },
      { stat: "0", label: "Pub ou spam" },
    ],
    inside: {
      label: "Au programme chaque semaine",
      items: [
        { icon: "🔬", tag: "REVUE", color: "#00e6be", title: "1 outil décortiqué", text: "Fonctionnalités, prix, limites — notre verdict honnête sur l'outil de la semaine. Testé pendant 3+ semaines, pas juste la démo." },
        { icon: "⚔️", tag: "VS", color: "#3b82f6", title: "1 comparatif", text: "Les meilleurs outils face à face. Scores détaillés, critères précis et notre choix final sans langue de bois." },
        { icon: "💸", tag: "DEAL", color: "#f59e0b", title: "Les meilleurs deals", text: "Trials gratuits, remises et nouvelles formules à ne pas rater. On surveille le marché pour vous." },
        { icon: "📡", tag: "RADAR", color: "#a855f7", title: "Le radar tendances", text: "Les lancements et tendances qui vont changer votre façon de travailler. Signal sur le bruit." },
      ],
    },
    testimonials: {
      label: "Ce qu'en disent les lecteurs",
      items: [
        { text: "La seule newsletter IA que j'attends vraiment chaque lundi. Honnête, sans blabla marketing, sans remplissage.", author: "Thomas D.", role: "Freelance développeur", avatar: "👨‍💻", stars: 5 },
        { text: "En 3 mois, j'ai découvert et adopté 4 outils grâce au Radar. ROI immédiat. Je l'ai recommandée à toute mon équipe.", author: "Camille R.", role: "Responsable marketing", avatar: "👩‍💼", stars: 5 },
        { text: "Enfin une newsletter qui ne fait pas de pub déguisée. Les comparatifs sont vraiment objectifs et sourcés.", author: "Marc L.", role: "Entrepreneur SaaS", avatar: "🧑‍💻", stars: 5 },
        { text: "Je lis des dizaines de newsletters tech. Neuriflux est dans le top 3 — dense, actionnable, sans spam.", author: "Sarah K.", role: "Product Manager", avatar: "👩‍💻", stars: 5 },
      ],
    },
    faq: {
      label: "Questions fréquentes",
      items: [
        { q: "C'est vraiment gratuit ?", a: "Oui, 100% gratuit. On se finance via des liens d'affiliation sur certains outils — ça ne change jamais nos avis. Un mauvais outil reste un mauvais outil, affilié ou non." },
        { q: "À quelle fréquence ?", a: "Un email par semaine, le lundi matin. Pas plus, pas moins. On n'envoie pas d'emails promotionnels supplémentaires. Promis." },
        { q: "Puis-je me désabonner facilement ?", a: "À tout moment, en un clic depuis n'importe quel email. Aucune question posée, aucun formulaire de désabonnement compliqué." },
        { q: "Mes données sont-elles partagées ?", a: "Non. Votre email n'est jamais vendu, loué ou partagé avec des tiers. Nous utilisons Supabase (RGPD-compliant) pour stocker les données." },
        { q: "Vous faites de la pub déguisée ?", a: "Non. Chaque lien affilié est signalé explicitement. Nos verdicts sont rédigés indépendamment des partenariats commerciaux." },
      ],
    },
    bottomCta: {
      title: "Rejoignez 3 200+ professionnels.",
      text: "Chaque lundi, l'essentiel de l'IA en 5 minutes. Gratuit, toujours.",
    },
    ftTagline: "Le média indépendant des outils IA.",
    ftContent: "Contenu", ftLegal: "Légal",
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
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    seo: {
      title: "The AI Radar — Free weekly AI newsletter | Neuriflux",
      description: "Join 3,200+ professionals who receive the best AI tools, honest comparisons and deals every Monday. Free, no spam.",
    },
    badge: "Free · No spam · Every Monday",
    title: "The Weekly",
    titleAccent: "AI Radar.",
    subtitle: "Every Monday morning, 3,200+ professionals receive the AI tools that actually matter, honest comparisons, and deals they don't want to miss.",
    placeholder: "your@email.com",
    cta: "Subscribe for free",
    ctaLoading: "Subscribing...",
    ctaSub: "Join the Radar →",
    privacy: "No spam · Unsubscribe in 1 click · Data stays private",
    social: "3,200+",
    socialLabel: "professionals subscribed",
    socialSub: "Marketers, devs, creators — every Monday",
    mockupLabel: "Preview of the latest edition",
    mockupDate: "Monday, March 24 2026",
    mockupSubject: "🔬 Cursor beats GitHub Copilot (full test) + top AI deals this week",
    mockupItems: [
      { tag: "REVIEW", color: "#00e6be", text: "Cursor vs Copilot vs Codeium — our 3-week real test" },
      { tag: "DEAL", color: "#f59e0b", text: "ElevenLabs: -40% on annual plan until Sunday" },
      { tag: "RADAR", color: "#a855f7", text: "GPT-4o vision API: what changes for developers" },
    ],
    success: {
      title: "Welcome to the Radar! 🎉",
      text: "Your next email arrives Monday. In the meantime, browse our AI comparisons.",
      cta: "See comparisons →",
    },
    error: "Something went wrong. Please try again or contact us.",
    proofs: [
      { stat: "3,200+", label: "Active subscribers" },
      { stat: "52", label: "Editions published" },
      { stat: "100%", label: "Free, always" },
      { stat: "0", label: "Ads or spam" },
    ],
    inside: {
      label: "Every week inside",
      items: [
        { icon: "🔬", tag: "REVIEW", color: "#00e6be", title: "1 tool reviewed", text: "Features, pricing, limits — our honest verdict on the tool of the week. Tested for 3+ weeks, not just the demo." },
        { icon: "⚔️", tag: "VS", color: "#3b82f6", title: "1 comparison", text: "The best tools head-to-head. Detailed scores, precise criteria and our final pick without sugarcoating." },
        { icon: "💸", tag: "DEAL", color: "#f59e0b", title: "Best deals", text: "Free trials, discounts and new plans you don't want to miss. We monitor the market for you." },
        { icon: "📡", tag: "RADAR", color: "#a855f7", title: "AI trends radar", text: "Launches and trends that will change the way you work. Signal over noise." },
      ],
    },
    testimonials: {
      label: "What readers say",
      items: [
        { text: "The only AI newsletter I genuinely look forward to every Monday. Honest, no marketing fluff, no filler.", author: "Thomas D.", role: "Freelance developer", avatar: "👨‍💻", stars: 5 },
        { text: "In 3 months, I discovered and adopted 4 tools thanks to the Radar. Immediate ROI. Recommended it to my whole team.", author: "Camille R.", role: "Marketing manager", avatar: "👩‍💼", stars: 5 },
        { text: "Finally a newsletter that doesn't do disguised advertising. The comparisons are genuinely objective and sourced.", author: "Marc L.", role: "SaaS entrepreneur", avatar: "🧑‍💻", stars: 5 },
        { text: "I read dozens of tech newsletters. Neuriflux is top 3 — dense, actionable, zero spam.", author: "Sarah K.", role: "Product Manager", avatar: "👩‍💻", stars: 5 },
      ],
    },
    faq: {
      label: "Frequently asked questions",
      items: [
        { q: "Is it really free?", a: "Yes, 100% free. We fund ourselves through affiliate links on some tools — it never changes our reviews. A bad tool stays a bad tool, affiliated or not." },
        { q: "How often?", a: "One email per week, Monday morning. No more, no less. We don't send additional promotional emails. Promise." },
        { q: "Can I unsubscribe easily?", a: "Anytime, in one click from any email. No questions asked, no complicated unsubscribe form." },
        { q: "Is my data shared?", a: "No. Your email is never sold, rented or shared with third parties. We use Supabase (GDPR-compliant) to store data." },
        { q: "Do you do disguised ads?", a: "No. Every affiliate link is explicitly disclosed. Our verdicts are written independently of commercial partnerships." },
      ],
    },
    bottomCta: {
      title: "Join 3,200+ professionals.",
      text: "Every Monday, the essential AI in 5 minutes. Free, always.",
    },
    ftTagline: "The independent AI tools media.",
    ftContent: "Content", ftLegal: "Legal",
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

const AVATARS = ["👨‍💻", "👩‍💼", "🧑‍🎨", "👩‍💻", "🧑‍🚀"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewsletterClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = T[lang];
  const l = (path: string) => `/${lang}${path}`;
  const { status, subscribe } = useNewsletter("newsletter-page");

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(email, lang);
  };

  const schema = {
    "@context": "https://schema.org", "@type": "WebPage",
    name: t.seo.title, description: t.seo.description,
    url: `https://neuriflux.com/${lang}/newsletter`,
    publisher: { "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com" },
  };
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: t.faq.items.map(item => ({
      "@type": "Question", name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <style>{`
        /* ─────────────────────────────────────────────────────────
           RESET & VARIABLES
        ───────────────────────────────────────────────────────── */
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,.065);--glow:rgba(0,230,190,.2);
          --cyan:#00e6be;--cdim:rgba(0,230,190,.09);
          --text:#edf2f7;--muted:#5a6a7a;--dim:#2a3a4a;
          --d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;
          --r:10px;--pad:clamp(1.5rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}

        /* ─────────────────────────────────────────────────────────
           FOND
        ───────────────────────────────────────────────────────── */
        .bg-grid{position:fixed;inset:0;
          background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);
          background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-10%;left:50%;transform:translateX(-50%);
          width:900px;height:700px;
          background:radial-gradient(ellipse,rgba(0,230,190,.07) 0%,transparent 68%);
          pointer-events:none;z-index:0}

        /* ─────────────────────────────────────────────────────────
           NAVIGATION
        ───────────────────────────────────────────────────────── */
        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(8,12,16,.93);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .2s}
        nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.4)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
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

        /* ─────────────────────────────────────────────────────────
           HERO — SPLIT 2 colonnes
        ───────────────────────────────────────────────────────── */
        .hero-wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:clamp(5rem,9vw,8rem) var(--pad) clamp(3rem,5vw,4rem)}
        .hero-split{display:grid;grid-template-columns:1fr 420px;gap:4rem;align-items:center}
        @media(max-width:900px){.hero-split{grid-template-columns:1fr}}

        /* Colonne gauche */
        .hero-left{}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.68rem;letter-spacing:.06em;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:5px 14px;margin-bottom:1.75rem}
        .badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero-title{font-size:clamp(2.5rem,6vw,4.2rem);font-weight:800;line-height:1.0;letter-spacing:-.05em;margin-bottom:1.1rem}
        .hero-title .ac{
          color:var(--cyan);position:relative;display:block;
          background:linear-gradient(90deg,var(--cyan),#00c9a7);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text
        }
        .hero-sub{font-family:var(--m);font-size:.88rem;font-weight:300;color:var(--muted);line-height:1.8;margin-bottom:2rem;max-width:460px}

        /* Social proof avatars */
        .social-row{display:flex;align-items:center;gap:.75rem;margin-bottom:1.75rem}
        .avs{display:flex}
        .av{width:28px;height:28px;border-radius:50%;background:var(--bg3);border:2px solid var(--bg2);display:flex;align-items:center;justify-content:center;font-size:.75rem;margin-left:-7px}
        .av:first-child{margin-left:0}
        .social-txt{font-family:var(--m);font-size:.7rem;color:var(--muted)}
        .social-txt strong{color:var(--cyan);font-weight:600}

        /* Formulaire hero */
        .form-hero{}
        .form-row{display:flex;gap:.55rem;margin-bottom:.65rem;flex-wrap:wrap}
        .nl-input{flex:1;min-width:200px;background:var(--bg2);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:13px 16px;color:var(--text);font-family:var(--m);font-size:.83rem;outline:none;transition:all .2s}
        .nl-input:focus{border-color:rgba(0,230,190,.35);box-shadow:0 0 0 3px rgba(0,230,190,.08)}
        .nl-input::placeholder{color:var(--dim)}
        .btn-main{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:800;font-size:.88rem;padding:13px 22px;border-radius:10px;border:none;cursor:pointer;transition:all .22s;letter-spacing:-.01em;white-space:nowrap}
        .btn-main:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(0,230,190,.35);background:#00ffce}
        .btn-main:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
        .form-note{font-family:var(--m);font-size:.63rem;color:var(--dim);display:flex;align-items:center;gap:.4rem}

        /* ─────────────────────────────────────────────────────────
           MOCKUP EMAIL — colonne droite
        ───────────────────────────────────────────────────────── */
        @media(max-width:900px){.hero-right{display:none}}
        .email-mockup{
          background:var(--bg2);border:1px solid var(--border);border-radius:16px;
          overflow:hidden;box-shadow:0 32px 72px rgba(0,0,0,.6),0 0 0 1px rgba(0,230,190,.07);
          position:relative
        }
        .email-mockup::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan) 40%,var(--cyan) 60%,transparent)}
        /* Barre "titre navigateur" */
        .mockup-topbar{background:var(--bg3);border-bottom:1px solid var(--border);padding:.65rem 1rem;display:flex;align-items:center;gap:.5rem}
        .mockup-dots{display:flex;gap:.35rem}
        .mockup-dot{width:10px;height:10px;border-radius:50%}
        .mockup-label{font-family:var(--m);font-size:.6rem;color:var(--dim);margin-left:.25rem;letter-spacing:.06em}
        /* Header email */
        .mockup-head{padding:1.1rem 1.25rem;border-bottom:1px solid var(--border);background:var(--bg2)}
        .mockup-from{display:flex;align-items:center;gap:.6rem;margin-bottom:.45rem}
        .mockup-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),#0099cc);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;color:#080c10;flex-shrink:0;font-family:var(--d)}
        .mockup-sender{font-family:var(--m);font-size:.68rem;color:var(--text);font-weight:500}
        .mockup-addr{font-family:var(--m);font-size:.6rem;color:var(--dim)}
        .mockup-date{font-family:var(--m);font-size:.6rem;color:var(--dim);margin-left:auto}
        .mockup-subject{font-family:var(--d);font-size:.82rem;font-weight:700;color:var(--text);letter-spacing:-.01em;line-height:1.35}
        /* Corps email */
        .mockup-body{padding:1.1rem 1.25rem;display:flex;flex-direction:column;gap:.65rem}
        .mockup-item{display:flex;align-items:flex-start;gap:.65rem;padding:.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:10px}
        .mockup-tag{font-family:var(--m);font-size:.52rem;font-weight:700;padding:2px 7px;border-radius:3px;letter-spacing:.08em;flex-shrink:0;margin-top:2px}
        .mockup-text{font-family:var(--m);font-size:.7rem;color:var(--muted);line-height:1.5;font-weight:300}
        /* Pied email */
        .mockup-foot{padding:.75rem 1.25rem;border-top:1px solid var(--border);background:var(--bg3);display:flex;align-items:center;justify-content:space-between}
        .mockup-unsub{font-family:var(--m);font-size:.56rem;color:var(--dim)}
        .mockup-logo{font-family:var(--d);font-size:.68rem;font-weight:800;color:var(--cyan);letter-spacing:-.02em}

        /* ─────────────────────────────────────────────────────────
           SUCCÈS
        ───────────────────────────────────────────────────────── */
        .success-box{background:var(--cdim);border:1px solid var(--glow);border-radius:16px;padding:2.5rem;position:relative;overflow:hidden;max-width:520px}
        .success-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .success-icon{font-size:2.25rem;display:block;margin-bottom:.9rem}
        .success-title{font-size:1.2rem;font-weight:800;letter-spacing:-.02em;color:var(--cyan);margin-bottom:.65rem}
        .success-text{font-family:var(--m);font-size:.76rem;color:var(--muted);line-height:1.65;margin-bottom:1.35rem;font-weight:300}
        .btn-outline{display:inline-flex;align-items:center;background:transparent;color:var(--cyan);font-family:var(--d);font-weight:700;font-size:.82rem;padding:9px 18px;border-radius:8px;text-decoration:none;border:1px solid var(--glow);transition:all .2s}
        .btn-outline:hover{background:var(--cdim);transform:translateY(-1px)}
        .error-msg{font-family:var(--m);font-size:.76rem;color:#ef4444;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:9px 13px;margin-bottom:.65rem}

        /* ─────────────────────────────────────────────────────────
           BANDE STATS
        ───────────────────────────────────────────────────────── */
        .stats-band{position:relative;z-index:1;background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .stats-inner{max-width:1100px;margin:0 auto;padding:0 var(--pad);display:grid;grid-template-columns:repeat(4,1fr);gap:0}
        @media(max-width:560px){.stats-inner{grid-template-columns:repeat(2,1fr)}}
        .stat-cell{padding:1.85rem 1rem;text-align:center;border-right:1px solid var(--border);transition:background .2s}
        .stat-cell:last-child{border-right:none}
        @media(max-width:560px){.stat-cell:nth-child(2){border-right:none}.stat-cell:nth-child(3){border-right:1px solid var(--border)}}
        .stat-cell:hover{background:var(--bg3)}
        .stat-val{font-family:var(--d);font-size:clamp(1.7rem,3.5vw,2.3rem);font-weight:800;letter-spacing:-.04em;color:var(--cyan);line-height:1;margin-bottom:.3rem}
        .stat-lbl{font-family:var(--m);font-size:.6rem;color:var(--muted);letter-spacing:.09em;text-transform:uppercase}

        /* ─────────────────────────────────────────────────────────
           SECTION COMMUNE
        ───────────────────────────────────────────────────────── */
        .section{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:clamp(3rem,5vw,4.5rem) var(--pad)}
        .sec-label{font-family:var(--m);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:2rem;display:flex;align-items:center;gap:.4rem}
        .sec-label::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}

        /* ─────────────────────────────────────────────────────────
           AU PROGRAMME — cards horizontales avec tag coloré
        ───────────────────────────────────────────────────────── */
        .inside-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}
        @media(max-width:700px){.inside-grid{grid-template-columns:1fr}}
        .icard{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1.6rem;transition:all .22s;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:.9rem}
        .icard:hover{transform:translateY(-3px);box-shadow:0 16px 42px rgba(0,0,0,.45)}
        .icard-top{display:flex;align-items:center;gap:.75rem}
        .icard-icon-wrap{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
        .icard-tag{font-family:var(--m);font-size:.57rem;font-weight:700;letter-spacing:.1em;padding:2px 8px;border-radius:4px}
        .icard-title{font-family:var(--d);font-size:.95rem;font-weight:800;letter-spacing:-.02em;color:var(--text)}
        .icard-text{font-family:var(--m);font-size:.74rem;color:var(--muted);line-height:1.72;font-weight:300}
        /* Barre de couleur en bas de la card */
        .icard-bar{position:absolute;bottom:0;left:0;right:0;height:2px;opacity:.5}

        /* ─────────────────────────────────────────────────────────
           TÉMOIGNAGES — grille 2×2 avec étoiles
        ───────────────────────────────────────────────────────── */
        .testi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}
        @media(max-width:700px){.testi-grid{grid-template-columns:1fr}}
        .tcard{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1.6rem;transition:border-color .2s;display:flex;flex-direction:column;gap:.8rem;position:relative;overflow:hidden}
        .tcard:hover{border-color:rgba(0,230,190,.15)}
        /* Guillemet décoratif */
        .tcard::before{content:'"';position:absolute;top:-.5rem;left:1rem;font-size:6rem;color:rgba(0,230,190,.04);font-family:Georgia,serif;line-height:1;pointer-events:none}
        .tcard-stars{display:flex;gap:2px}
        .tcard-star{color:#f59e0b;font-size:.72rem}
        .tcard-text{font-family:var(--m);font-size:.76rem;line-height:1.78;color:#c8d5e0;font-weight:300;position:relative;z-index:1}
        .tcard-foot{display:flex;align-items:center;gap:.65rem;padding-top:.75rem;border-top:1px solid var(--border);margin-top:auto}
        .tcard-av{width:32px;height:32px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0}
        .tcard-author{font-family:var(--d);font-size:.78rem;font-weight:700;color:var(--text);letter-spacing:-.01em}
        .tcard-role{font-family:var(--m);font-size:.63rem;color:var(--dim);font-weight:300}

        /* ─────────────────────────────────────────────────────────
           FAQ — accordéon amélioré
        ───────────────────────────────────────────────────────── */
        .faq-wrap{max-width:700px;margin:0 auto}
        .faq-item{border-bottom:1px solid var(--border);overflow:hidden}
        .faq-item:first-child{border-top:1px solid var(--border)}
        .faq-btn{width:100%;background:none;border:none;padding:1.2rem 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;gap:1.25rem;transition:all .15s}
        .faq-btn:hover .faq-q{color:var(--cyan)}
        .faq-q{font-family:var(--d);font-size:.92rem;font-weight:700;color:var(--text);letter-spacing:-.01em;transition:color .15s;line-height:1.35}
        .faq-chevron{
          width:22px;height:22px;border-radius:50%;border:1px solid var(--border);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
          transition:all .25s;color:var(--muted)
        }
        .faq-chevron svg{width:10px;height:10px;transition:transform .25s}
        .faq-item.open .faq-chevron{background:var(--cdim);border-color:var(--glow);color:var(--cyan)}
        .faq-item.open .faq-chevron svg{transform:rotate(180deg)}
        .faq-a{font-family:var(--m);font-size:.76rem;color:var(--muted);line-height:1.78;font-weight:300;padding-bottom:1.2rem;display:none;max-width:620px}
        .faq-a.open{display:block}

        /* ─────────────────────────────────────────────────────────
           BOTTOM CTA — dramatique
        ───────────────────────────────────────────────────────── */
        .bottom-section{position:relative;z-index:1;padding:0 var(--pad) clamp(4rem,7vw,6rem)}
        .bottom-box{
          max-width:820px;margin:0 auto;
          background:linear-gradient(135deg,rgba(0,230,190,.07) 0%,rgba(0,153,204,.04) 50%,rgba(0,0,0,0) 100%);
          border:1px solid rgba(0,230,190,.22);border-radius:24px;
          padding:clamp(2.5rem,5vw,4rem);text-align:center;
          position:relative;overflow:hidden
        }
        /* Ligne lumineuse top */
        .bottom-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:65%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan) 40%,var(--cyan) 60%,transparent)}
        /* Glow ambiant */
        .bottom-glow{position:absolute;top:-50%;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(0,230,190,.08),transparent 68%);pointer-events:none}
        /* Coins décoratifs */
        .bottom-corner{position:absolute;width:60px;height:60px}
        .bottom-corner.tl{top:0;left:0;border-top:1px solid rgba(0,230,190,.3);border-left:1px solid rgba(0,230,190,.3);border-radius:24px 0 0 0}
        .bottom-corner.tr{top:0;right:0;border-top:1px solid rgba(0,230,190,.3);border-right:1px solid rgba(0,230,190,.3);border-radius:0 24px 0 0}
        .bottom-corner.bl{bottom:0;left:0;border-bottom:1px solid rgba(0,230,190,.3);border-left:1px solid rgba(0,230,190,.3);border-radius:0 0 0 24px}
        .bottom-corner.br{bottom:0;right:0;border-bottom:1px solid rgba(0,230,190,.3);border-right:1px solid rgba(0,230,190,.3);border-radius:0 0 24px 0}
        .bottom-eyebrow{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:.4rem}
        .bottom-eyebrow::before{content:'';width:24px;height:1px;background:var(--cyan)}
        .bottom-eyebrow::after{content:'';width:24px;height:1px;background:var(--cyan)}
        .bottom-title{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-.05em;line-height:1.05;margin-bottom:.85rem;position:relative;z-index:1}
        .bottom-text{font-family:var(--m);font-size:.84rem;color:var(--muted);line-height:1.65;margin-bottom:2.25rem;position:relative;z-index:1;font-weight:300}
        .bottom-form{display:flex;gap:.55rem;flex-wrap:wrap;justify-content:center;max-width:460px;margin:0 auto 1rem;position:relative;z-index:1}
        .bottom-note{font-family:var(--m);font-size:.63rem;color:var(--dim);position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:.4rem}
        /* Avatars bottom */
        .bottom-avs{display:flex;align-items:center;justify-content:center;gap:.65rem;margin-top:1.5rem;position:relative;z-index:1}
        .bavs{display:flex}
        .bav{width:26px;height:26px;border-radius:50%;background:var(--bg3);border:2px solid var(--bg2);display:flex;align-items:center;justify-content:center;font-size:.7rem;margin-left:-7px}
        .bav:first-child{margin-left:0}
        .bav-txt{font-family:var(--m);font-size:.65rem;color:var(--muted)}
        .bav-txt strong{color:var(--cyan)}

        /* ─────────────────────────────────────────────────────────
           FOOTER — identique à HomeClient (3 colonnes)
        ───────────────────────────────────────────────────────── */
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.25rem var(--pad);max-width:1160px;margin:0 auto}
        .ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
        @media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
        .ft-tag{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.65;max-width:210px;margin-top:.4rem}
        .ft-col{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
        .ft-ul{list-style:none;display:flex;flex-direction:column;gap:.45rem}
        .ft-ul a{font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;transition:color .15s;font-weight:300}
        .ft-ul a:hover{color:var(--cyan)}
        .ft-bot{margin-top:1.75rem;padding-top:1.1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── NAVIGATION ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")}>{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")} className="active">{t.nav.newsletter}</a></li>
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

      {/* ── HERO SPLIT ── */}
      <div className="hero-wrap">
        <div className="hero-split">

          {/* Gauche : pitch + form */}
          <div className="hero-left">
            <div className="badge"><div className="badge-dot" />{t.badge}</div>
            <h1 className="hero-title">
              {t.title}<br />
              <span className="ac">{t.titleAccent}</span>
            </h1>
            <p className="hero-sub">{t.subtitle}</p>

            <div className="social-row">
              <div className="avs">
                {AVATARS.map((a, i) => <div key={i} className="av">{a}</div>)}
              </div>
              <div className="social-txt">
                <strong>{t.social}</strong> {t.socialLabel}
              </div>
            </div>

            {status === "success" ? (
              <div className="success-box">
                <span className="success-icon">🎉</span>
                <div className="success-title">{t.success.title}</div>
                <p className="success-text">{t.success.text}</p>
                <a href={l("/comparatifs")} className="btn-outline">{t.success.cta}</a>
              </div>
            ) : (
              <div className="form-hero">
                {status === "error" && <p className="error-msg">⚠ {t.error}</p>}
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <input type="email" className="nl-input" placeholder={t.placeholder}
                      value={email} onChange={e => setEmail(e.target.value)}
                      required disabled={status === "loading"} />
                    <button type="submit" className="btn-main" disabled={status === "loading"}>
                      {status === "loading" ? t.ctaLoading : t.cta}
                    </button>
                  </div>
                  <div className="form-note">🔒 {t.privacy}</div>
                </form>
              </div>
            )}
          </div>

          {/* Droite : mockup email */}
          <div className="hero-right">
            <div style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)", textAlign: "center", marginBottom: ".65rem", letterSpacing: ".08em", textTransform: "uppercase" }}>
              {t.mockupLabel}
            </div>
            <div className="email-mockup">
              {/* Barre navigateur */}
              <div className="mockup-topbar">
                <div className="mockup-dots">
                  <div className="mockup-dot" style={{ background: "#ef4444" }} />
                  <div className="mockup-dot" style={{ background: "#f59e0b" }} />
                  <div className="mockup-dot" style={{ background: "#10b981" }} />
                </div>
                <div className="mockup-label">Neuriflux · Radar IA</div>
              </div>
              {/* Header email */}
              <div className="mockup-head">
                <div className="mockup-from">
                  <div className="mockup-avatar">N</div>
                  <div>
                    <div className="mockup-sender">Neuriflux · Radar IA</div>
                    <div className="mockup-addr">radar@neuriflux.com</div>
                  </div>
                  <div className="mockup-date">{t.mockupDate}</div>
                </div>
                <div className="mockup-subject">{t.mockupSubject}</div>
              </div>
              {/* Corps email */}
              <div className="mockup-body">
                {t.mockupItems.map((item, i) => (
                  <div key={i} className="mockup-item">
                    <span className="mockup-tag" style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}35` }}>
                      {item.tag}
                    </span>
                    <span className="mockup-text">{item.text}</span>
                  </div>
                ))}
              </div>
              {/* Pied email */}
              <div className="mockup-foot">
                <div className="mockup-unsub">{lang === "fr" ? "Se désabonner · 1 clic" : "Unsubscribe · 1 click"}</div>
                <div className="mockup-logo">Neuriflux</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-band">
        <div className="stats-inner">
          {t.proofs.map((p, i) => (
            <div key={i} className="stat-cell">
              <div className="stat-val">{p.stat}</div>
              <div className="stat-lbl">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AU PROGRAMME ── */}
      <div className="section">
        <div className="sec-label">{t.inside.label}</div>
        <div className="inside-grid">
          {t.inside.items.map((item, i) => (
            <div key={i} className="icard" style={{ borderColor: `${item.color}22` }}>
              <div className="icard-top">
                <div className="icard-icon-wrap" style={{ background: `${item.color}14` }}>
                  {item.icon}
                </div>
                <div>
                  <span className="icard-tag" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>{item.tag}</span>
                </div>
              </div>
              <div className="icard-title">{item.title}</div>
              <div className="icard-text">{item.text}</div>
              <div className="icard-bar" style={{ background: `linear-gradient(90deg,${item.color},transparent)` }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── TÉMOIGNAGES ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="sec-label">{t.testimonials.label}</div>
        <div className="testi-grid">
          {t.testimonials.items.map((item, i) => (
            <div key={i} className="tcard">
              <div className="tcard-stars">
                {Array.from({ length: item.stars }).map((_, j) => (
                  <span key={j} className="tcard-star">★</span>
                ))}
              </div>
              <p className="tcard-text">"{item.text}"</p>
              <div className="tcard-foot">
                <div className="tcard-av">{item.avatar}</div>
                <div>
                  <div className="tcard-author">{item.author}</div>
                  <div className="tcard-role">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="sec-label">{t.faq.label}</div>
        <div className="faq-wrap">
          {t.faq.items.map((item, i) => (
            <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="faq-q">{item.q}</span>
                <span className="faq-chevron">
                  <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1l4 4 4-4" />
                  </svg>
                </span>
              </button>
              <div className={`faq-a${openFaq === i ? " open" : ""}`}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      {status !== "success" && (
        <div className="bottom-section">
          <div className="bottom-box">
            <div className="bottom-glow" />
            <div className="bottom-corner tl" /><div className="bottom-corner tr" />
            <div className="bottom-corner bl" /><div className="bottom-corner br" />
            <div className="bottom-eyebrow">{lang === "fr" ? "Newsletter gratuite" : "Free newsletter"}</div>
            <h2 className="bottom-title">{t.bottomCta.title}</h2>
            <p className="bottom-text">{t.bottomCta.text}</p>
            <form onSubmit={handleSubmit}>
              <div className="bottom-form">
                <input type="email" className="nl-input" placeholder={t.placeholder}
                  value={email} onChange={e => setEmail(e.target.value)}
                  required disabled={status === "loading"} />
                <button type="submit" className="btn-main" disabled={status === "loading"}>
                  {status === "loading" ? t.ctaLoading : t.ctaSub}
                </button>
              </div>
            </form>
            <div className="bottom-note">🔒 {t.privacy}</div>
            <div className="bottom-avs">
              <div className="bavs">
                {AVATARS.map((a, i) => <div key={i} className="bav">{a}</div>)}
              </div>
              <div className="bav-txt">
                <strong>{t.social}</strong> {t.socialLabel}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer>
        <div className="ft">
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}>
              <div className="logo-dot" />Neuri<em>flux</em>
            </a>
            <p className="ft-tag">{t.ftTagline}</p>
          </div>
          <div>
            <div className="ft-col">{t.ftContent}</div>
            <ul className="ft-ul">
              {t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="ft-col">{t.ftLegal}</div>
            <ul className="ft-ul">
              {t.ftLegal2.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}
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