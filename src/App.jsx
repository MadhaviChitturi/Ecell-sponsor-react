import { useEffect, useRef, useState } from "react";
import "./App.css";

const EMAIL = "corporate_ecell@smail.iitm.ac.in";

const TIERS = [
  { cls: "tier--title", label: "HIGHEST TIER", name: "Title Sponsor",
    desc: "Our lead partner, associated with the summit's name and present across every touchpoint of the event.",
    logos: [["kotak.jpeg", "Kotak Mahindra Bank"]] },
  { cls: "tier--co", label: "CO-TITLE TIER", name: "Co-Title Sponsor",
    desc: "Sharing top billing with our title sponsor, backing the summit at the highest level of support.",
    logos: [["wb.jpeg", "West Bengal Government"]] },
  { label: "PARTNER", name: "Legal Partner",
    desc: "Providing legal counsel and support across the summit's operations and agreements.",
    logos: [["trilegal.jpeg", "Trilegal"]] },
  { label: "PARTNERS", name: "Travel Partners",
    desc: "Helping founders, speakers, and delegates get to campus.",
    logos: [["abhibus.jpeg", "AbhiBus"], ["easemytrip.jpeg", "EaseMyTrip"]] },
  { label: "PARTNER", name: "Accommodation Partner",
    desc: "Hosting our guests and delegation for the duration of the summit.",
    logos: [["bloom.jpeg", "Bloom Hotels"]] },
];

const STATS = [
  { target: 15000, suffix: "+", label: "students reached" },
  { target: 1000, suffix: "+", label: "founders in attendance" },
  { target: 6, suffix: "", label: "partners already onboard" },
];

/* Adds "in-view" once the element scrolls into view */
function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function CountUp({ target, suffix, run }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / 1500, 1);
      setN(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target]);
  return <>{n.toLocaleString()}<span className="gold">{suffix}</span></>;
}

function Tier({ tier, index, lit }) {
  const [ref, seen] = useInView(0.3);
  useEffect(() => { if (seen) lit(index); }, [seen]);
  return (
    <div ref={ref} className={`tier ${tier.cls || ""} ${seen ? "in-view" : ""}`}>
      <div>
        <div className="tier-label">{tier.label}</div>
        <div className="tier-name">{tier.name}</div>
        <div className="tier-desc">{tier.desc}</div>
      </div>
      <div className="logo-row">
        {tier.logos.map(([file, alt]) => (
          <div className="logo-tile" key={file}>
            <img src={`${import.meta.env.BASE_URL}Logos/${file}`} alt={alt} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [curtainHidden, setCurtainHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [litNodes, setLitNodes] = useState([]);
  const [railFilled, setRailFilled] = useState(false);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const [ctaRef, ctaSeen] = useInView(0.3);
  const [footRef, footSeen] = useInView(0.2);

  useEffect(() => {
    const t = setTimeout(() => setCurtainHidden(true), 550);
    requestAnimationFrame(() => setRailFilled(true));
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  const lit = (i) => setLitNodes((p) => (p.includes(i) ? p : [...p, i]));

  const onHeroMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const onMagnet = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPull({ x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4 });
  };

  return (
    <>
      <div className={`curtain ${curtainHidden ? "hide" : ""}`} />
      <div className="progress-bar" style={{ width: `${progress}%` }} />

      <nav className="nav">
        <div className="nav-logo">E<span>-</span>CELL</div>
      </nav>

      <section className="hero" onMouseMove={onHeroMove}>
        <div className="hero-spotlight" style={{ "--mx": `${spot.x}%`, "--my": `${spot.y}%` }} />
        <div className="hero-inner">
          <div className="hero-eyebrow-line" />
          <h1><span className="word" style={{ animationDelay: "0.55s" }}>Sponsors</span></h1>
          <p>Every summit runs on the partners who back it. Here's who's fuelling this year's edition — and how you can be part of the next.</p>
          <a className="hero-cta" href={`mailto:${EMAIL}`}
             style={{ transform: `translate(${pull.x}px, ${pull.y}px)` }}
             onMouseMove={onMagnet} onMouseLeave={() => setPull({ x: 0, y: 0 })}>
            Talk to our corporate relations team →
          </a>
        </div>
      </section>

      <div className="manifest">
        <div className={`rail ${railFilled ? "filled" : ""}`}>
          <div className="rail-line" />
          {[4, 110, 130, 130, 130].map((m, i) => (
            <div key={i} className={`rail-node ${litNodes.includes(i) ? "lit" : ""}`} style={{ marginTop: m }} />
          ))}
        </div>
        <div className="tiers">
          {TIERS.map((t, i) => <Tier key={t.name} tier={t} index={i} lit={lit} />)}
        </div>
      </div>

      {/* Stats */}
      <section className="stats" ref={ctaRef}>
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <div className="stat-num"><CountUp {...s} run={ctaSeen} /></div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* CTA band (from design 2, in design 1's purple + brass theme) */}
      <section className="band">
        <div className="band-inner">
          <h2>Want to sponsor E-Summit?</h2>
          <p>Reach students and founders from across the country, and stand alongside our current partners.</p>
          <a className="band-cta" href={`mailto:${EMAIL}`}><span>{EMAIL} →</span></a>
        </div>
      </section>

      <footer ref={footRef} className={footSeen ? "in-view" : ""}>
        <div className="footer-simple">
          <div className="footer-copyright">
            © Developed by Web Operations | E-Cell | IIT Madras. <span>All Rights Reserved.</span>
          </div>
          <div className="footer-contact">
            <div className="contact-title">For issues related to the website, contact:</div>
            <a href="https://wa.me/919845823575" target="_blank" rel="noopener noreferrer">
              Dhruv : +91 98458 23575
              <span className="whatsapp-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.48 0 .13 5.35.13 11.93c0 2.1.55 4.15 1.6 5.96L.03 24l6.25-1.64a11.93 11.93 0 0 0 5.76 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.19-1.24-6.19-3.45-8.43ZM12.05 21.86h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.71.98.99-3.62-.23-.37a9.91 9.91 0 0 1-1.52-5.32C2.16 6.45 6.6 2.02 12.05 2.02c2.64 0 5.12 1.03 6.98 2.89a9.82 9.82 0 0 1 2.89 7c0 5.46-4.43 9.9-9.87 9.95Zm5.42-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </footer>

      <button className={`to-top ${showTop ? "visible" : ""}`} aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </>
  );
}
