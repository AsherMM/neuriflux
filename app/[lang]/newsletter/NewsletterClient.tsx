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
    badge: "Gratuit · 3 200+ lecteurs · Chaque lundi",
    title: "Le Radar IA",
    titleAccent: "de la semaine.",
    subtitle: "Chaque lundi matin : les outils IA qui comptent vraiment, les comparatifs honnêtes, et les deals à ne pas rater. Zéro spam. Désabonnement en 1 clic.",
    placeholder: "votre@email.com",
    cta: "Je m'abonne gratuitement",
    ctaLoading: "Inscription...",
    ctaSub: "Rejoindre →",
    privacy: "Pas de spam. Désabonnement en 1 clic. Données privées.",
    social: "3 200+",
    socialLabel: "professionnels déjà abonnés",
    socialSub: "Marketeurs, devs, créateurs — chaque lundi",
    success: {
      title: "Bienvenue dans le Radar ! 🎉",
      text: "Vous recevrez votre premier email lundi prochain. En attendant, explorez nos comparatifs.",
      cta: "Voir les comparatifs →",
    },
    error: "Une erreur s'est produite. Réessayez.",
    inside: {
      label: "Au programme chaque semaine",
      items: [
        { icon: "🔬", title: "1 outil décortiqué", text: "Fonctionnalités, prix, limites — notre verdict honnête sur l'outil de la semaine." },
        { icon: "⚔️", title: "1 comparatif", text: "Les meilleurs outils face à face. Scores détaillés et notre choix final." },
        { icon: "💸", title: "Les meilleurs deals", text: "Trials gratuits, remises et nouvelles formules à ne pas rater." },
        { icon: "📡", title: "Le radar tendances", text: "Les lancements et tendances qui vont changer votre façon de travailler." },
      ],
    },
    testimonials: {
      label: "Ce qu'en disent les lecteurs",
      items: [
        { text: "La seule newsletter IA que j'attends chaque lundi. Honnête, sans blabla marketing.", author: "Thomas D.", role: "Freelance développeur", avatar: "👨‍💻" },
        { text: "En 3 mois, j'ai découvert et adopté 4 outils grâce au Radar. ROI immédiat.", author: "Camille R.", role: "Responsable marketing", avatar: "👩‍💼" },
        { text: "Enfin une newsletter qui ne fait pas de la pub déguisée. Les comparatifs sont vraiment objectifs.", author: "Marc L.", role: "Entrepreneur", avatar: "🧑‍💻" },
      ],
    },
    faq: {
      label: "Questions fréquentes",
      items: [
        { q: "C'est vraiment gratuit ?", a: "Oui, 100% gratuit. On se finance via des liens d'affiliation sur certains outils — ça ne change jamais nos avis." },
        { q: "À quelle fréquence ?", a: "Un email par semaine, le lundi matin. Pas plus, pas moins. Promis." },
        { q: "Puis-je me désabonner ?", a: "À tout moment, en un clic depuis n'importe quel email. Aucune question posée, aucun formulaire." },
        { q: "Vos données sont-elles partagées ?", a: "Non. Votre email n'est jamais vendu, loué ou partagé avec des tiers." },
        { q: "Vous faites de la pub déguisée ?", a: "Non. Quand un lien est affilié, on le dit explicitement. Nos avis restent 100% indépendants." },
      ],
    },
    bottomCta: { title: "Prêt à rejoindre le Radar ?", text: "3 200+ professionnels reçoivent déjà leur dose d'IA chaque lundi. Gratuit, toujours." },
    footer: {
      rights: "Tous droits réservés.", madeWith: "Fait avec", inFrance: "en France",
      links: [{ label: "Mentions légales", href: "/legal" }, { label: "Confidentialité", href: "/privacy" }, { label: "Cookies", href: "/cookies" }],
    },
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    seo: {
      title: "The AI Radar — Free weekly AI newsletter | Neuriflux",
      description: "Join 3,200+ professionals who receive the best AI tools, honest comparisons and deals every Monday. Free, no spam.",
    },
    badge: "Free · 3,200+ readers · Every Monday",
    title: "The Weekly",
    titleAccent: "AI Radar.",
    subtitle: "Every Monday morning: the AI tools that actually matter, honest comparisons, and deals you don't want to miss. Zero spam. Unsubscribe in 1 click.",
    placeholder: "your@email.com",
    cta: "Subscribe for free",
    ctaLoading: "Subscribing...",
    ctaSub: "Subscribe →",
    privacy: "No spam. Unsubscribe in 1 click. Data stays private.",
    social: "3,200+",
    socialLabel: "professionals already subscribed",
    socialSub: "Marketers, devs, creators — every Monday",
    success: {
      title: "Welcome to the Radar! 🎉",
      text: "You'll receive your first email next Monday. In the meantime, browse our comparisons.",
      cta: "See comparisons →",
    },
    error: "Something went wrong. Please try again.",
    inside: {
      label: "Every week inside",
      items: [
        { icon: "🔬", title: "1 tool reviewed", text: "Features, pricing, limits — our honest verdict on the tool of the week." },
        { icon: "⚔️", title: "1 comparison", text: "The best tools head-to-head. Detailed scores and our final pick." },
        { icon: "💸", title: "Best deals", text: "Free trials, discounts and new plans you don't want to miss." },
        { icon: "📡", title: "AI radar", text: "Launches and trends that will change the way you work." },
      ],
    },
    testimonials: {
      label: "What readers say",
      items: [
        { text: "The only AI newsletter I look forward to every Monday. Honest, no marketing fluff.", author: "Thomas D.", role: "Freelance developer", avatar: "👨‍💻" },
        { text: "In 3 months, I discovered and adopted 4 tools thanks to the Radar. Immediate ROI.", author: "Camille R.", role: "Marketing manager", avatar: "👩‍💼" },
        { text: "Finally a newsletter that doesn't do disguised advertising. The comparisons are genuinely objective.", author: "Marc L.", role: "Entrepreneur", avatar: "🧑‍💻" },
      ],
    },
    faq: {
      label: "Frequently asked questions",
      items: [
        { q: "Is it really free?", a: "Yes, 100% free. We fund ourselves through affiliate links on some tools — it never changes our reviews." },
        { q: "How often?", a: "One email per week, Monday morning. No more, no less. Promise." },
        { q: "Can I unsubscribe?", a: "Anytime, in one click from any email. No questions asked, no forms to fill." },
        { q: "Is my data shared?", a: "No. Your email is never sold, rented or shared with third parties." },
        { q: "Do you do disguised ads?", a: "No. When a link is affiliated, we say so explicitly. Our reviews stay 100% independent." },
      ],
    },
    bottomCta: { title: "Ready to join the Radar?", text: "3,200+ professionals already get their AI dose every Monday. Free, always." },
    footer: {
      rights: "All rights reserved.", madeWith: "Made with", inFrance: "in France",
      links: [{ label: "Legal notice", href: "/legal" }, { label: "Privacy", href: "/privacy" }, { label: "Cookies", href: "/cookies" }],
    },
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

  // Schema JSON-LD — Newsletter + FAQPage
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t.seo.title,
    description: t.seo.description,
    url: `https://neuriflux.com/${lang}/newsletter`,
    publisher: { "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com" },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.items.map(item => ({
      "@type": "Question",
      name: item.q,
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
           NAVIGATION — identique sur toutes les pages
        ───────────────────────────────────────────────────────── */
        nav{
          position:sticky;top:0;z-index:100;
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          background:rgba(8,12,16,.93);border-bottom:1px solid var(--border);
          padding:0 var(--pad);height:60px;
          display:flex;align-items:center;justify-content:space-between;
          transition:box-shadow .2s
        }
        nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.4)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;
          letter-spacing:-.03em;color:var(--text);text-decoration:none;
          display:flex;align-items:center;gap:.45rem}
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

        /* ─────────────────────────────────────────────────────────
           HERO — centré, impactant
        ───────────────────────────────────────────────────────── */
        .hero{
          position:relative;z-index:1;
          max-width:780px;margin:0 auto;
          padding:clamp(5rem,10vw,8rem) var(--pad) clamp(2.5rem,5vw,4rem);
          text-align:center
        }
        .badge{
          display:inline-flex;align-items:center;gap:.5rem;
          font-family:var(--m);font-size:.7rem;letter-spacing:.06em;
          color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);
          border-radius:100px;padding:6px 16px;margin-bottom:2rem
        }
        .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero-title{
          font-size:clamp(2.8rem,7.5vw,5.5rem);font-weight:800;
          line-height:1.0;letter-spacing:-.05em;margin-bottom:1.25rem
        }
        .hero-title .ac{
          color:var(--cyan);position:relative;display:inline-block
        }
        /* Ligne lumineuse sous l'accent */
        .hero-title .ac::after{
          content:'';position:absolute;bottom:4px;left:0;right:0;height:3px;
          background:var(--cyan);opacity:.25;border-radius:2px
        }
        .hero-sub{
          font-family:var(--m);font-size:clamp(.85rem,1.6vw,.98rem);
          font-weight:300;color:var(--muted);line-height:1.75;
          max-width:560px;margin:0 auto 2.5rem
        }

        /* Social proof */
        .social-row{display:flex;align-items:center;justify-content:center;gap:.75rem;margin-bottom:2.25rem}
        .avs{display:flex}
        .av{width:30px;height:30px;border-radius:50%;background:var(--bg3);border:2px solid var(--bg);
          display:flex;align-items:center;justify-content:center;font-size:.82rem;margin-left:-8px}
        .av:first-child{margin-left:0}
        .social-txt{font-family:var(--m);font-size:.73rem;color:var(--muted);text-align:left}
        .social-txt strong{color:var(--cyan);font-weight:600}

        /* ─────────────────────────────────────────────────────────
           FORMULAIRE HERO — grand et impactant
        ───────────────────────────────────────────────────────── */
        .form-hero{max-width:520px;margin:0 auto}
        .form-row{display:flex;gap:.65rem;flex-wrap:wrap;justify-content:center;margin-bottom:.75rem}
        .nl-input{
          flex:1;min-width:220px;
          background:var(--bg2);border:1px solid var(--border);border-radius:10px;
          padding:14px 18px;color:var(--text);font-family:var(--m);font-size:.88rem;
          outline:none;transition:all .2s
        }
        .nl-input:focus{border-color:rgba(0,230,190,.3);box-shadow:0 0 0 3px rgba(0,230,190,.07)}
        .nl-input::placeholder{color:var(--dim)}
        .btn-p{
          display:inline-flex;align-items:center;gap:.5rem;
          background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;
          font-size:.9rem;padding:14px 24px;border-radius:10px;border:none;
          cursor:pointer;text-decoration:none;transition:all .2s;
          letter-spacing:-.01em;white-space:nowrap
        }
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,230,190,.32)}
        .btn-p:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
        .form-note{font-family:var(--m);font-size:.66rem;color:var(--dim);text-align:center;line-height:1.5}

        /* ─────────────────────────────────────────────────────────
           SUCCÈS
        ───────────────────────────────────────────────────────── */
        .success-box{
          background:var(--cdim);border:1px solid var(--glow);border-radius:16px;
          padding:2.5rem;text-align:center;max-width:480px;margin:0 auto;
          position:relative;overflow:hidden
        }
        .success-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
          width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .success-icon{font-size:2.5rem;display:block;margin-bottom:1rem}
        .success-title{font-size:1.3rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.75rem;color:var(--cyan)}
        .success-text{font-family:var(--m);font-size:.78rem;color:var(--muted);line-height:1.65;margin-bottom:1.5rem;font-weight:300}
        .btn-outline{display:inline-flex;align-items:center;background:transparent;color:var(--cyan);
          font-family:var(--d);font-weight:700;font-size:.85rem;padding:10px 20px;
          border-radius:8px;text-decoration:none;border:1px solid var(--glow);transition:all .2s}
        .btn-outline:hover{background:var(--cdim);transform:translateY(-1px)}
        .error-msg{font-family:var(--m);font-size:.78rem;color:#ef4444;background:rgba(239,68,68,.08);
          border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:10px 16px;
          text-align:center;max-width:480px;margin:0 auto .75rem}

        /* ─────────────────────────────────────────────────────────
           SECTIONS
        ───────────────────────────────────────────────────────── */
        .section{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:clamp(2.5rem,5vw,4rem) var(--pad)}
        .sec-label{
          font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
          color:var(--cyan);margin-bottom:1.75rem;display:flex;align-items:center;gap:.4rem
        }
        .sec-label::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}

        /* ─────────────────────────────────────────────────────────
           CONTENU — 4 cards "Au programme"
        ───────────────────────────────────────────────────────── */
        .inside-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.15rem}
        .icard{
          background:var(--bg2);border:1px solid var(--border);border-radius:13px;
          padding:1.5rem;transition:all .2s;position:relative;overflow:hidden
        }
        .icard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:var(--cyan);transform:scaleX(0);transform-origin:left;transition:transform .28s}
        .icard:hover{border-color:var(--glow);transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,0,0,.4)}
        .icard:hover::before{transform:scaleX(1)}
        .icard-icon{font-size:1.6rem;margin-bottom:.75rem;display:block}
        .icard-title{font-family:var(--d);font-size:.9rem;font-weight:700;letter-spacing:-.01em;margin-bottom:.45rem;color:var(--text)}
        .icard-text{font-family:var(--m);font-size:.72rem;color:var(--muted);line-height:1.65;font-weight:300}

        /* ─────────────────────────────────────────────────────────
           TÉMOIGNAGES
        ───────────────────────────────────────────────────────── */
        .testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.15rem}
        .tcard{
          background:var(--bg2);border:1px solid var(--border);border-radius:13px;
          padding:1.65rem;transition:border-color .2s;display:flex;flex-direction:column;gap:.75rem
        }
        .tcard:hover{border-color:var(--glow)}
        .tcard-stars{color:#f59e0b;font-size:.75rem;letter-spacing:2px}
        .tcard-text{font-family:var(--m);font-size:.78rem;line-height:1.75;color:#c8d5e0;flex:1;font-weight:300}
        .tcard-foot{display:flex;align-items:center;gap:.65rem;padding-top:.75rem;border-top:1px solid var(--border)}
        .tcard-av{width:30px;height:30px;border-radius:50%;background:var(--bg3);
          border:1px solid var(--border);display:flex;align-items:center;justify-content:center;
          font-size:.88rem;flex-shrink:0}
        .tcard-author{font-family:var(--m);font-size:.72rem;color:var(--text);font-weight:500}
        .tcard-role{font-family:var(--m);font-size:.65rem;color:var(--dim);font-weight:300}

        /* ─────────────────────────────────────────────────────────
           FAQ — accordéon
        ───────────────────────────────────────────────────────── */
        .faq-list{display:flex;flex-direction:column;gap:.65rem;max-width:700px;margin:0 auto}
        .faq-item{background:var(--bg2);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .18s}
        .faq-item.open{border-color:var(--glow)}
        .faq-btn{
          width:100%;background:none;border:none;padding:1.1rem 1.35rem;
          display:flex;justify-content:space-between;align-items:center;
          cursor:pointer;text-align:left;gap:1rem
        }
        .faq-btn:hover .faq-q{color:var(--cyan)}
        .faq-q{font-family:var(--d);font-size:.9rem;font-weight:600;color:var(--text);letter-spacing:-.01em;transition:color .15s}
        .faq-icon{
          width:20px;height:20px;border-radius:50%;border:1px solid var(--border);
          display:flex;align-items:center;justify-content:center;
          font-family:var(--m);font-size:1rem;color:var(--cyan);flex-shrink:0;transition:all .2s
        }
        .faq-item.open .faq-icon{background:var(--cdim);border-color:var(--glow);transform:rotate(45deg)}
        .faq-a{font-family:var(--m);font-size:.76rem;color:var(--muted);line-height:1.72;font-weight:300;padding:0 1.35rem 1.1rem;display:none}
        .faq-a.open{display:block}

        /* ─────────────────────────────────────────────────────────
           BOTTOM CTA — dernier appel à l'action
        ───────────────────────────────────────────────────────── */
        .bottom-cta{position:relative;z-index:1;max-width:780px;margin:0 auto;padding:0 var(--pad) clamp(3rem,6vw,5rem)}
        .bottom-box{
          background:var(--bg2);border:1px solid var(--glow);border-radius:18px;
          padding:clamp(2rem,4vw,3rem);text-align:center;position:relative;overflow:hidden
        }
        .bottom-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
          width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .bottom-glow{position:absolute;top:-45%;left:50%;transform:translateX(-50%);
          width:500px;height:300px;
          background:radial-gradient(ellipse,rgba(0,230,190,.065),transparent 68%);
          pointer-events:none}
        .bottom-title{font-size:clamp(1.4rem,3.2vw,2rem);font-weight:800;letter-spacing:-.04em;margin-bottom:.75rem;position:relative;z-index:1}
        .bottom-text{font-family:var(--m);font-size:.8rem;color:var(--muted);line-height:1.65;margin-bottom:2rem;position:relative;z-index:1;font-weight:300}
        .bottom-form{display:flex;gap:.65rem;flex-wrap:wrap;justify-content:center;max-width:440px;margin:0 auto .75rem;position:relative;z-index:1}

        /* ─────────────────────────────────────────────────────────
           FOOTER
        ───────────────────────────────────────────────────────── */
        footer{
          position:relative;z-index:1;border-top:1px solid var(--border);
          padding:1.75rem var(--pad);max-width:1000px;margin:0 auto;
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem
        }
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
        .ft-links{display:flex;gap:1.25rem;list-style:none}
        .ft-links a{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none;transition:color .15s}
        .ft-links a:hover{color:var(--muted)}
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── NAVIGATION ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo">
          <div className="logo-dot" />
          Neuri<em>flux</em>
        </a>
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

      {/* ── HERO ── */}
      <div className="hero">
        <div className="badge"><div className="badge-dot" />{t.badge}</div>
        <h1 className="hero-title">
          {t.title}<br /><span className="ac">{t.titleAccent}</span>
        </h1>
        <p className="hero-sub">{t.subtitle}</p>

        {/* Social proof */}
        <div className="social-row">
          <div className="avs">
            {AVATARS.map((a, i) => <div key={i} className="av">{a}</div>)}
          </div>
          <div className="social-txt">
            <strong>{t.social}</strong> {t.socialLabel}<br />
            <span style={{ fontSize: ".65rem" }}>{t.socialSub}</span>
          </div>
        </div>

        {/* Formulaire ou succès */}
        {status === "success" ? (
          <div className="success-box">
            <span className="success-icon">🎉</span>
            <div className="success-title">{t.success.title}</div>
            <p className="success-text">{t.success.text}</p>
            <a href={l("/comparatifs")} className="btn-outline">{t.success.cta}</a>
          </div>
        ) : (
          <div className="form-hero">
            {status === "error" && <p className="error-msg">{t.error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input type="email" className="nl-input" placeholder={t.placeholder}
                  value={email} onChange={e => setEmail(e.target.value)}
                  required disabled={status === "loading"} />
                <button type="submit" className="btn-p" disabled={status === "loading"}>
                  {status === "loading" ? t.ctaLoading : t.cta}
                </button>
              </div>
              <p className="form-note">🔒 {t.privacy}</p>
            </form>
          </div>
        )}
      </div>

      {/* ── AU PROGRAMME ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="sec-label">{t.inside.label}</div>
        <div className="inside-grid">
          {t.inside.items.map((item, i) => (
            <div key={i} className="icard">
              <span className="icard-icon">{item.icon}</span>
              <div className="icard-title">{item.title}</div>
              <p className="icard-text">{item.text}</p>
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
              <div className="tcard-stars">★★★★★</div>
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
        <div className="faq-list">
          {t.faq.items.map((item, i) => (
            <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="faq-q">{item.q}</span>
                <span className="faq-icon">+</span>
              </button>
              <div className={`faq-a${openFaq === i ? " open" : ""}`}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      {status !== "success" && (
        <div className="bottom-cta">
          <div className="bottom-box">
            <div className="bottom-glow" />
            <h2 className="bottom-title">{t.bottomCta.title}</h2>
            <p className="bottom-text">{t.bottomCta.text}</p>
            <form onSubmit={handleSubmit}>
              <div className="bottom-form">
                <input type="email" className="nl-input" placeholder={t.placeholder}
                  value={email} onChange={e => setEmail(e.target.value)}
                  required disabled={status === "loading"} />
                <button type="submit" className="btn-p" disabled={status === "loading"}>
                  {status === "loading" ? t.ctaLoading : t.ctaSub}
                </button>
              </div>
              <p className="form-note" style={{ position: "relative", zIndex: 1 }}>🔒 {t.privacy}</p>
            </form>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer>
        <span className="ft-copy">© 2026 <em>Neuriflux</em>. {t.footer.rights} {t.footer.madeWith} <em>♥</em> {t.footer.inFrance}</span>
        <ul className="ft-links">
          {t.footer.links.map((x, i) => <li key={i}><a href={l(x.href)}>{x.label}</a></li>)}
        </ul>
      </footer>
    </>
  );
}