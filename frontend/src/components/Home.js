import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const T = {
  bgDeep:      "#03040a",
  bgSurface:   "rgba(13,21,38,0.88)",
  accent:      "#00d4ff",
  accentGlow:  "rgba(0,212,255,0.35)",
  violet:      "#7c4dff",
  textPri:     "#f0f4ff",
  textSec:     "#8899b0",
  textMuted:   "#4a5568",
  border:      "rgba(255,255,255,0.07)",
  borderLit:   "rgba(0,212,255,0.28)",
  fontDisplay: "'Syne', sans-serif",
  fontBody:    "'DM Sans', sans-serif",
};

function ScoreRingSVG({ score = 92, size = 160 }) {
  const cx   = size / 2;
  const cy   = size / 2;
  const r    = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const offset = circ * 0.25;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", margin: "0 auto" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="6" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.accent} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} strokeDashoffset={offset}
        opacity="0.25" style={{ filter: "blur(6px)" }} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.accent} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 8px ${T.accent}99)` }} />
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
        fill={T.accent} fontSize={size * 0.28} fontWeight="800" fontFamily="Syne, sans-serif">
        {score}
      </text>
      <text x={cx} y={cy + size * 0.19} textAnchor="middle"
        fill="rgba(255,255,255,0.3)" fontSize={size * 0.08} fontFamily="DM Sans, sans-serif" letterSpacing="0.04em">
        out of 100
      </text>
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats]          = useState(null);
  const [statsLoading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "CareerForge — AI Resume Analyzer";
    axios.get(`${API}/api/resume/stats`)
      .then(r => { if (r.data.success) setStats(r.data.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const liveScore    = stats?.latest?.score ?? null;
  const liveCareer   = stats?.latest?.careerPath ?? null;
  const liveSkills   = stats?.latest?.foundSkills?.slice(0, 4) ?? ["React", "TypeScript", "Node.js", "AWS"];
  const totalResumes = stats?.totalResumes ?? 0;
  const avgScore     = stats?.avgScore ?? 0;

  return (
    <div style={s.page}>

      <div style={s.gridOverlay} />
      <div style={{ ...s.orb, width: 520, height: 520, background: "rgba(0,212,255,0.07)", top: -220, left: -220 }} />
      <div style={{ ...s.orb, width: 460, height: 460, background: "rgba(124,77,255,0.08)", bottom: -160, right: -160 }} />

      {/* ── NAVBAR ── */}
      <motion.nav style={s.navbar}
        initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
        <div style={s.logoWrap}>
          <div style={s.logoMark}>CF</div>
          <span style={s.logoText}>CareerForge</span>
        </div>
        <div style={s.navLinks}>
          {[
            { l: "Features",     fn: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
            { l: "How It Works", fn: () => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }) },
            { l: "History",      fn: () => navigate("/history") },
          ].map(item => (
            <motion.span key={item.l} style={s.navItem} whileHover={{ color: T.textPri }} onClick={item.fn}>
              {item.l}
            </motion.span>
          ))}
        </div>
        <motion.button style={s.navBtn}
          whileHover={{ scale: 1.04, boxShadow: `0 0 22px ${T.accentGlow}` }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/upload")}>
          Get Started
        </motion.button>
      </motion.nav>

      {/* ── HERO ── */}
      <section style={s.hero}>

        {/* Left */}
        <motion.div style={s.heroLeft}
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>

          <motion.div style={s.badge} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <span style={s.badgeDot} />
            AI-Powered Resume Intelligence
          </motion.div>

          <h1 style={s.heroTitle}>
            Turn Your<br />
            <span style={s.heroAccent}>Resume</span><br />
            Into Results
          </h1>

          <p style={s.heroSub}>
            CareerForge evaluates your technical profile with precision —
            surfacing skill gaps, matching you to roles, and delivering
            insights that actually move the needle.
          </p>

          <div style={s.heroBtns}>
            <motion.button style={s.primaryBtn}
              whileHover={{ scale: 1.05, boxShadow: `0 0 32px ${T.accentGlow}` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/upload")}>
              Analyze My Resume
            </motion.button>
            <motion.button style={s.ghostBtn}
              whileHover={{ borderColor: "rgba(0,212,255,0.55)", color: T.accent }}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              See How It Works
            </motion.button>
          </div>


        </motion.div>

        {/* Right — live score card */}
        <motion.div style={s.heroCard}
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6 }}>

          <div style={s.cardHeaderRow}>
            <span style={s.cardLabel}>
              {totalResumes > 0 ? "Latest Analysis" : "Live Score Preview"}
            </span>
            <span style={s.cardBadge}>
              {totalResumes > 0 ? `${totalResumes} analyzed` : "AI"}
            </span>
          </div>

          <motion.div style={{ marginBottom: 16 }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>
            {statsLoading ? (
              <div style={{ width: 164, height: 164, margin: "0 auto", borderRadius: "50%", border: "6px solid rgba(0,212,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid transparent", borderTop: `3px solid ${T.accent}` }}
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
              </div>
            ) : (
              <ScoreRingSVG score={liveScore ?? 85} size={164} />
            )}
          </motion.div>

          <p style={s.scoreCardLabel}>
            {statsLoading ? "Loading latest data..." : liveCareer ?? "Upload a resume to see your score"}
          </p>

          <div style={s.miniSkills}>
            {liveSkills.map((sk, i) => (
              <motion.span key={sk} style={s.miniTag}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}>
                {sk}
              </motion.span>
            ))}
          </div>

          {!statsLoading && totalResumes > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "center", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 800, color: T.accent }}>{avgScore}%</span>
                <span style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.06em" }}>AVG SCORE</span>
              </div>
              <div style={{ width: 1, background: T.border }} />
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 800, color: T.textPri }}>{totalResumes}</span>
                <span style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.06em" }}>RESUMES</span>
              </div>
            </motion.div>
          )}

          <div style={{ position: "absolute", top: 14, left: 14, width: 20, height: 20, borderTop: `1px solid ${T.borderLit}`, borderLeft: `1px solid ${T.borderLit}` }} />
          <div style={{ position: "absolute", bottom: 14, right: 14, width: 20, height: 20, borderBottom: `1px solid ${T.borderLit}`, borderRight: `1px solid ${T.borderLit}` }} />
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <motion.div style={s.statsWrap}
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.65 }}>
        {[
          { n: totalResumes > 0 ? `${totalResumes}` : "0", l: "Resumes Analyzed" },
          { n: avgScore > 0 ? `${avgScore}%` : "—",        l: "Avg Score"        },
          { n: "4",                                         l: "Roles Per Analysis"},
          { n: "< 5s",                                      l: "Analysis Time"    },
        ].map((item, i) => (
          <React.Fragment key={i}>
            <div style={s.statItem}>
              <span style={s.statNum}>{item.n}</span>
              <span style={s.statLbl}>{item.l}</span>
            </div>
            {i < 3 && <div style={s.statDivider} />}
          </React.Fragment>
        ))}
      </motion.div>

      {/* ── FEATURES ── */}
      <section id="features" style={s.section}>
        <motion.div style={{ textAlign: "center", marginBottom: 56 }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={s.eyebrow}>Core Capabilities</p>
          <h2 style={s.sectionTitle}>Built for developers.<br />Tuned for results.</h2>
        </motion.div>
        <div style={s.featureGrid}>
          {[
            { num: "01", title: "Smart Resume Analysis",  accent: T.accent, desc: "Upload your resume and receive an instant AI evaluation of your skills, experience depth, and overall profile strength." },
            { num: "02", title: "Skill Gap Detection",    accent: T.violet, desc: "Surface missing technologies and competencies that recruiters look for — ranked by impact on your job search." },
            { num: "03", title: "Career Path Mapping",    accent: "#f0c040", desc: "Get role recommendations and career trajectories derived from your current skill set and technology stack." },
          ].map((f, i) => (
            <motion.div key={i} style={s.featureCard}
              initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -8, borderColor: f.accent + "44" }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 44, fontWeight: 800, color: f.accent + "40", display: "block", marginBottom: 14, letterSpacing: "-0.04em", lineHeight: 1 }}>{f.num}</span>
              <div style={{ width: 28, height: 3, borderRadius: 2, background: f.accent, marginBottom: 18, opacity: 0.7 }} />
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10, color: T.textPri }}>{f.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: T.textSec, fontWeight: 300 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={s.section}>
        <motion.div style={{ textAlign: "center", marginBottom: 56 }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={s.eyebrow}>Process</p>
          <h2 style={s.sectionTitle}>Three steps to clarity.</h2>
        </motion.div>
        <div style={s.stepsGrid}>
          {[
            { n: "1", title: "Upload",  desc: "Drop your PDF resume — we handle the parsing instantly." },
            { n: "2", title: "Analyze", desc: "Our AI maps your skills against thousands of job requirements." },
            { n: "3", title: "Improve", desc: "Get a score, gap list, and role matches in under 5 seconds." },
          ].map((step, i) => (
            <motion.div key={i} style={s.stepCard}
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}>
              <div style={s.stepCircle}>{step.n}</div>
              <h4 style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: T.textPri, marginBottom: 8 }}>{step.title}</h4>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textSec, fontWeight: 300 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.section style={s.ctaSection}
        initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <div style={s.ctaInner}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "radial-gradient(ellipse at 50% 110%, rgba(0,212,255,0.08), transparent 65%)", pointerEvents: "none" }} />
          <p style={s.eyebrow}>Get Started Free</p>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12, color: T.textPri }}>
            Ready to unlock your potential?
          </h2>
          <p style={{ fontSize: 15, color: T.textSec, marginBottom: 36, fontWeight: 300, maxWidth: 420, margin: "0 auto 36px" }}>
            Upload your resume and get a detailed analysis in seconds — completely free.
          </p>
          <motion.button style={s.primaryBtn}
            whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${T.accentGlow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/upload")}>
            Analyze My Resume Now
          </motion.button>
        </div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={s.logoWrap}>
            <div style={{ ...s.logoMark, width: 28, height: 28, fontSize: 11 }}>CF</div>
            <span style={{ ...s.logoText, fontSize: 15 }}>CareerForge</span>
          </div>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 10 }}>AI-powered resume intelligence for tech professionals.</p>
          <p style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>© 2026 CareerForge. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: T.bgDeep, color: T.textPri, fontFamily: T.fontBody, overflowX: "hidden", position: "relative" },
  gridOverlay: {
    position: "fixed", inset: 0,
    backgroundImage: `linear-gradient(rgba(0,212,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.022) 1px, transparent 1px)`,
    backgroundSize: "64px 64px", pointerEvents: "none", zIndex: 0,
  },
  orb: { position: "fixed", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none", zIndex: 0 },

  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 60px", position: "sticky", top: 0, zIndex: 100,
    backdropFilter: "blur(22px)", background: "rgba(3,4,10,0.85)",
    borderBottom: `1px solid ${T.border}`,
  },
  logoWrap:  { display: "flex", alignItems: "center", gap: 11 },
  logoMark: {
    width: 34, height: 34, borderRadius: 8, background: T.accent, color: "#000",
    fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    letterSpacing: "0.06em", flexShrink: 0,
  },
  logoText:  { fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 17, color: T.textPri, letterSpacing: "-0.02em" },
  navLinks:  { display: "flex", gap: 34, alignItems: "center" },
  navItem:   { color: T.textSec, cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "color 0.2s" },
  navBtn: {
    padding: "9px 20px", border: `1px solid ${T.borderLit}`, borderRadius: "8px",
    background: "transparent", color: T.accent, cursor: "pointer",
    fontWeight: 600, fontSize: 13, fontFamily: T.fontBody,
  },

  hero: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 60, padding: "110px 60px 80px",
    maxWidth: 1280, margin: "0 auto",
    position: "relative", zIndex: 1, flexWrap: "wrap",
  },
  heroLeft: { flex: "1 1 460px", maxWidth: 580 },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "6px 14px", border: "1px solid rgba(0,212,255,0.22)",
    borderRadius: 100, fontSize: 11, fontWeight: 600, color: T.accent,
    background: "rgba(0,212,255,0.06)", marginBottom: 28,
    letterSpacing: "0.06em", textTransform: "uppercase",
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: "50%", background: T.accent,
    boxShadow: `0 0 7px ${T.accent}`, display: "inline-block", flexShrink: 0,
  },
  heroTitle: {
    fontFamily: T.fontDisplay, fontSize: "clamp(48px,6vw,80px)",
    fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em",
    marginBottom: 24, color: T.textPri,
  },
  heroAccent: {
    background: `linear-gradient(130deg, ${T.accent} 10%, ${T.violet} 90%)`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline",
  },
  heroSub:   { fontSize: 16, lineHeight: 1.8, color: T.textSec, marginBottom: 36, maxWidth: 490, fontWeight: 300 },
  heroBtns:  { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 0 },
  primaryBtn: {
    padding: "13px 28px", border: "none", borderRadius: "12px",
    background: T.accent, color: "#000", cursor: "pointer",
    fontWeight: 700, fontSize: 14, letterSpacing: "0.02em", fontFamily: T.fontBody,
  },
  ghostBtn: {
    padding: "13px 28px", borderRadius: "12px", border: `1px solid ${T.border}`,
    background: "transparent", color: T.textSec, cursor: "pointer",
    fontWeight: 500, fontSize: 14, fontFamily: T.fontBody, transition: "all 0.2s",
  },


  heroCard: {
    flex: "0 0 320px", background: "rgba(13,21,38,0.94)", backdropFilter: "blur(28px)",
    border: `1px solid ${T.border}`, borderRadius: "26px", padding: "28px 24px 24px",
    position: "relative", boxShadow: "0 0 50px rgba(0,212,255,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
    textAlign: "center", transition: "box-shadow 0.3s",
  },
  cardHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  cardLabel: { fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" },
  cardBadge: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
    color: T.accent, background: "rgba(0,212,255,0.09)",
    border: "1px solid rgba(0,212,255,0.22)", padding: "3px 8px", borderRadius: 4,
  },
  scoreCardLabel: { fontSize: 12, color: T.textSec, marginBottom: 16, fontWeight: 400 },
  miniSkills: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  miniTag: {
    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)",
    color: T.accent, letterSpacing: "0.02em",
  },

  statsWrap: {
    display: "flex", alignItems: "center", justifyContent: "center",
    maxWidth: 820, margin: "0 auto 96px",
    padding: "26px 44px", background: "rgba(13,21,38,0.8)", backdropFilter: "blur(20px)",
    border: `1px solid ${T.border}`, borderRadius: "18px",
    position: "relative", zIndex: 1,
  },
  statItem: { flex: 1, textAlign: "center" },
  statNum: { display: "block", fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, color: T.accent, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 5 },
  statLbl: { fontSize: 11, color: T.textMuted, fontWeight: 400, letterSpacing: "0.04em" },
  statDivider: { width: 1, height: 32, background: T.border, flexShrink: 0 },

  section: { padding: "0 60px 100px", maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.accent, marginBottom: 12 },
  sectionTitle: { fontFamily: T.fontDisplay, fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: T.textPri },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 },
  featureCard: {
    background: "rgba(13,21,38,0.8)", backdropFilter: "blur(20px)",
    border: `1px solid ${T.border}`, borderRadius: "18px", padding: "32px 26px",
    position: "relative", overflow: "hidden", transition: "all 0.3s ease",
  },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 },
  stepCard: {
    background: "rgba(13,21,38,0.8)", backdropFilter: "blur(20px)",
    border: `1px solid ${T.border}`, borderRadius: "18px", padding: "28px 24px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  stepCircle: {
    width: 44, height: 44, borderRadius: "50%",
    border: `1.5px solid ${T.borderLit}`, background: "rgba(0,212,255,0.07)",
    color: T.accent, fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },

  ctaSection: { padding: "0 60px 100px", position: "relative", zIndex: 1 },
  ctaInner: {
    background: "rgba(13,21,38,0.92)", backdropFilter: "blur(24px)",
    border: `1px solid ${T.border}`, borderRadius: "28px", padding: "72px 48px",
    textAlign: "center", maxWidth: 640, margin: "0 auto",
    position: "relative", overflow: "hidden", boxShadow: "0 0 80px rgba(0,0,0,0.4)",
  },

  footer: { borderTop: `1px solid ${T.border}`, padding: "32px 60px", position: "relative", zIndex: 1 },
};