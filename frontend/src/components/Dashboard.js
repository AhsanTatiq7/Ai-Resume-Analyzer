import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const T = {
  bgDeep:      "#03040a",
  bgSurface:   "rgba(13,21,38,0.88)",
  bgMid:       "rgba(13,21,38,0.95)",
  accent:      "#00d4ff",
  accentDim:   "rgba(0,212,255,0.08)",
  accentGlow:  "rgba(0,212,255,0.28)",
  accentBorder:"rgba(0,212,255,0.22)",
  violet:      "#7c4dff",
  blue:        "#4d9fff",
  amber:       "#f59e0b",
  red:         "#ef4444",
  textPri:     "#f0f4ff",
  textSec:     "#8899b0",
  textMuted:   "#4a5568",
  border:      "rgba(255,255,255,0.07)",
  borderLit:   "rgba(0,212,255,0.28)",
  fontDisplay: "'Syne', sans-serif",
  fontBody:    "'DM Sans', sans-serif",
};

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1800, delay = 400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const timeout = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        // ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(eased * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

/* ── Animated SVG arc ── */
function AnimatedScoreArc({ score, size = 200 }) {
  const r    = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const clr  = score >= 75 ? T.accent : score >= 50 ? T.amber : T.red;
  const displayScore = useCountUp(score, 1600, 300);
  const [arcProgress, setArcProgress] = useState(0);

  useEffect(() => {
    let start = null;
    let raf;
    const timeout = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1600, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setArcProgress(eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, 300);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [score]);

  const fill   = arcProgress * (score / 100) * circ;
  const offset = circ * 0.25;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
        {/* bg track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>
        {/* glow layer */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={clr} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          strokeDashoffset={offset}
          opacity="0.15"
          style={{ filter: "blur(10px)" }}
        />
        {/* main arc */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={clr} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 12px ${clr}99)` }}
        />
        {/* score number */}
        <text x={size/2} y={size/2 - 8} textAnchor="middle" dominantBaseline="middle"
          fill={clr} fontSize={size * 0.28} fontWeight="900"
          fontFamily="DM Sans, sans-serif" style={{ letterSpacing: "-2px" }}>
          {displayScore}
        </text>
        <text x={size/2} y={size/2 + size * 0.185} textAnchor="middle"
          fill="rgba(255,255,255,0.2)" fontSize={size * 0.075}
          fontFamily="DM Sans, sans-serif" letterSpacing="2">
          OUT OF 100
        </text>
      </svg>
      {/* pulsing ring on completion */}
      {arcProgress >= 0.99 && (
        <motion.div
          style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            border: `1px solid ${clr}`,
            pointerEvents: "none",
          }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.12 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      )}
    </div>
  );
}

/* ── Priority tag ── */
function PriorityTag({ priority }) {
  const map = {
    high:   { label: "High Priority",  color: T.red,    bg: "rgba(255,77,109,0.1)",  border: "rgba(255,77,109,0.25)"  },
    medium: { label: "Medium",          color: T.amber,  bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
    low:    { label: "Nice to Have",    color: T.textSec,bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
  };
  const p = map[priority] || map.low;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, fontFamily: T.fontDisplay,
      padding: "2px 7px", borderRadius: 4,
      background: p.bg, border: `1px solid ${p.border}`,
      color: p.color, letterSpacing: "0.06em",
      textTransform: "uppercase", flexShrink: 0,
    }}>
      {p.label}
    </span>
  );
}

/* ── Role card ── */
function RoleCard({ role, index, careerPath }) {
  const [hovered, setHovered] = useState(false);

  const roleDetails = {
    "Frontend Developer":      { icon: "⬡", desc: "Build user interfaces and web experiences using modern JS frameworks.", match: 95 },
    "React Developer":         { icon: "⬡", desc: "Specialize in React ecosystem — components, hooks, state management.", match: 92 },
    "Full Stack Developer":    { icon: "◈", desc: "Own both frontend and backend. Build complete features end-to-end.", match: 88 },
    "Backend Developer":       { icon: "◆", desc: "Design APIs, manage databases, and handle server-side logic.", match: 85 },
    "Software Engineer":       { icon: "◈", desc: "Broad engineering role — system design, scalability, cross-team work.", match: 84 },
    "MERN Stack Developer":    { icon: "◈", desc: "MongoDB, Express, React, Node.js — the full JavaScript stack.", match: 90 },
    "Node.js Developer":       { icon: "◆", desc: "Build fast, scalable backend services and APIs with Node.js.", match: 82 },
    "UI Developer":            { icon: "⬡", desc: "Focus on visual implementation — pixel-perfect, responsive UIs.", match: 88 },
    "Web Developer":           { icon: "⬡", desc: "Build and maintain websites — both visual and functional layers.", match: 86 },
    "Python Developer":        { icon: "◆", desc: "Build backend systems, scripts, and automation with Python.", match: 80 },
    "Software Developer":      { icon: "◈", desc: "General software development across languages and platforms.", match: 78 },
    "Application Developer":   { icon: "◈", desc: "Build desktop or enterprise applications with robust architecture.", match: 76 },
    "Mobile Developer":        { icon: "⬡", desc: "Build iOS and Android apps using React Native or Flutter.", match: 72 },
    "Junior Developer":        { icon: "◆", desc: "Entry-level role across the stack — great for building experience.", match: 70 },
  };

  const details = roleDetails[role] || {
    icon: "◆",
    desc: "A strong opportunity aligned with your current technical profile.",
    match: Math.max(60, 92 - index * 6),
  };

  const matchColor = details.match >= 88 ? T.accent : details.match >= 78 ? T.blue : T.amber;

  return (
    <motion.div
      style={{
        ...s.roleCard,
        borderColor: hovered ? matchColor + "35" : T.border,
        background:  hovered ? T.bgDeep : T.bgSurface,
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ x: 4 }}
    >
      {/* left icon */}
      <div style={{ ...s.roleIcon, color: matchColor, borderColor: matchColor + "30", background: matchColor + "0d" }}>
        {details.icon}
      </div>

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={s.roleName}>{role}</span>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 9, color: T.textMuted, letterSpacing: "0.06em" }}>
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.p
              style={s.roleDesc}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {details.desc}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* match % */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: matchColor, letterSpacing: "-0.02em" }}>
          {details.match}%
        </span>
        <span style={{ display: "block", fontSize: 9, color: T.textMuted, letterSpacing: "0.06em", marginTop: 2 }}>MATCH</span>
      </div>
    </motion.div>
  );
}

/* ── Missing skill with priority ── */
function prioritizeSkill(skill, careerPath) {
  const highPriority = {
    "Full Stack Development":  ["TypeScript", "Docker", "AWS", "Redis", "GraphQL", "Kubernetes"],
    "Frontend Development":    ["TypeScript", "Next.js", "Testing", "GraphQL", "Webpack", "Vite"],
    "Backend Development":     ["Docker", "AWS", "Redis", "Kubernetes", "TypeScript", "PostgreSQL"],
    "Software Development":    ["Docker", "AWS", "TypeScript", "Kubernetes", "CI/CD", "Testing"],
    "Mobile Development":      ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "TypeScript"],
    "DevOps & Cloud":          ["Kubernetes", "Terraform", "AWS", "Docker", "CI/CD", "Ansible"],
    "Data Science":            ["TensorFlow", "PyTorch", "Pandas", "Scikit-learn", "SQL", "Spark"],
  };
  const medPriority = {
    "Full Stack Development":  ["PostgreSQL", "Next.js", "Jest", "CI/CD", "Nginx"],
    "Frontend Development":    ["Redux", "React Query", "Cypress", "Storybook", "Performance"],
    "Backend Development":     ["GraphQL", "MongoDB", "Testing", "Message Queues", "gRPC"],
    "Software Development":    ["Microservices", "Redis", "GraphQL", "PostgreSQL", "Testing"],
  };

  const high = (highPriority[careerPath] || highPriority["Full Stack Development"]).map(s => s.toLowerCase());
  const med  = (medPriority[careerPath]  || medPriority["Full Stack Development"]).map(s => s.toLowerCase());
  const sk   = skill.toLowerCase();

  if (high.some(h => sk.includes(h) || h.includes(sk))) return "high";
  if (med.some(m => sk.includes(m) || m.includes(sk)))  return "medium";
  return "low";
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(13,21,38,0.88)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: T.textPri, fontFamily: T.fontBody }}>
      <strong>{payload[0].name}</strong>: {payload[0].value}%
    </div>
  );
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
});

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis;
  const [activeSkillTab, setActiveSkillTab] = useState("all");

  useEffect(() => {
    document.title = "Dashboard — CareerForge";
    return () => { document.title = "CareerForge — AI Resume Analyzer"; };
  }, []);

  if (!analysis) {
    return (
      <div style={{ minHeight: "100vh", background: T.bgDeep, color: T.textPri, display: "flex", flexDirection: "column", gap: 16, justifyContent: "center", alignItems: "center", fontFamily: T.fontBody }}>
        <p style={{ fontFamily: T.fontDisplay, fontSize: 13, color: T.accent, letterSpacing: "0.06em" }}>{'// ERROR_404'}</p>
        <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>No analysis data found</p>
        <motion.button style={{ padding: "12px 28px", background: T.accent, border: "none", borderRadius: 8, color: "#000", fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}
          whileHover={{ scale: 1.04 }} onClick={() => navigate("/upload")}>
          Upload a Resume
        </motion.button>
      </div>
    );
  }

  const scoreColor = analysis.score >= 75 ? T.accent : analysis.score >= 50 ? T.amber : T.red;
  const scoreLabel = analysis.score >= 75 ? "Strong Profile" : analysis.score >= 50 ? "Moderate Profile" : "Needs Work";
  const scoreSubLabel = analysis.score >= 75
    ? "You're competitive for most roles in this path."
    : analysis.score >= 50
    ? "A few key skills will significantly boost your chances."
    : "Focus on building core skills before applying.";

  const chartData = [
    { name: "Match", value: analysis.score },
    { name: "Gap",   value: 100 - analysis.score },
  ];

  // prioritized missing skills
  const prioritizedMissing = (analysis.missingSkills || []).map(sk => ({
    skill: sk,
    priority: prioritizeSkill(sk, analysis.careerPath),
  })).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const filteredMissing = activeSkillTab === "all"
    ? prioritizedMissing
    : prioritizedMissing.filter(s => s.priority === activeSkillTab);

  const highCount   = prioritizedMissing.filter(s => s.priority === "high").length;
  const medCount    = prioritizedMissing.filter(s => s.priority === "medium").length;
  const lowCount    = prioritizedMissing.filter(s => s.priority === "low").length;

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />

      {/* ── TOPBAR ── */}
      <motion.header style={s.topBar} {...fadeUp(0)}>
        <div style={s.topBarLeft}>
          <div style={s.logoMark} onClick={() => navigate("/")}>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14, color: T.accent }}>
              [CF]
            </span>
          </div>
          <div style={s.topBarDivider} />
          <p style={s.topBarTitle}>{'// ANALYSIS_REPORT'}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* score pill in topbar */}
          <div style={{ ...s.scorePill, background: scoreColor + "12", borderColor: scoreColor + "35", color: scoreColor }}>
            {analysis.score}% · {scoreLabel}
          </div>
          <motion.button style={s.ghostBtn} whileHover={{ scale: 1.03 }} onClick={() => navigate("/history")}>
            History
          </motion.button>
          <motion.button style={s.greenBtn}
            whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${T.accentGlow}` }}
            onClick={() => navigate("/upload")}>
            New Analysis
          </motion.button>
        </div>
      </motion.header>

      <main style={s.main}>

        {/* ══ ROW 1: Score + Career + Chart ══ */}
        <div style={s.row3}>

          {/* SCORE CARD — animated reveal */}
          <motion.div style={{ ...s.card, ...s.scoreCardAccent }} {...fadeUp(0.05)}>
            <div style={s.cardMonoRow}>
              <span style={s.cardMonoDot} />
              <span style={s.cardMonoText}>Resume Score</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10, paddingTop: 8 }}>
              <AnimatedScoreArc score={analysis.score} size={176} />
              <motion.div
                style={{ textAlign: "center" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
              >
                <span style={{ ...s.badge, background: scoreColor + "12", borderColor: scoreColor + "35", color: scoreColor, display: "inline-block", marginBottom: 6 }}>
                  {scoreLabel}
                </span>
                <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6, maxWidth: 200 }}>
                  {scoreSubLabel}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* CAREER PATH */}
          <motion.div style={s.card} {...fadeUp(0.1)}>
            <div style={s.cardMonoRow}>
              <span style={s.cardMonoDot} />
              <span style={s.cardMonoText}>Career Path</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "4px 0" }}>
              <motion.h2
                style={s.careerTitle}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {analysis.careerPath}
              </motion.h2>
              <div style={{ width: "100%", marginTop: 16 }}>
                {[
                  { label: "Technical Skills",      pct: Math.min(100, Math.round(analysis.score * 1.05)), color: T.accent  },
                  { label: "Profile Completeness",  pct: Math.min(100, Math.round(analysis.score * 0.90)), color: T.blue   },
                  { label: "Market Readiness",      pct: Math.min(100, Math.round(analysis.score * 0.82)), color: T.purple },
                ].map((bar, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: T.textSec, fontWeight: 500 }}>{bar.label}</span>
                      <span style={{ fontFamily: T.fontDisplay, fontSize: 11, color: bar.color }}>{bar.pct}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                      <motion.div
                        style={{ height: "100%", borderRadius: 2, background: bar.color, boxShadow: `0 0 8px ${bar.color}88` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.pct}%` }}
                        transition={{ delay: 0.6 + i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.metaRow}>
              {[
                { l: "Score",  v: `${analysis.score}%`,                c: T.accent  },
                { l: "Skills", v: analysis.foundSkills?.length ?? 0,   c: T.blue   },
                { l: "Gaps",   v: analysis.missingSkills?.length ?? 0, c: T.red    },
              ].map((m, i) => (
                <React.Fragment key={i}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <motion.span
                      style={{ display: "block", fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, color: m.c, letterSpacing: "-0.02em" }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.1 }}>
                      {m.v}
                    </motion.span>
                    <span style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase" }}>{m.l}</span>
                  </div>
                  {i < 2 && <div style={{ width: 1, background: T.border }} />}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* COVERAGE CHART */}
          <motion.div style={s.card} {...fadeUp(0.15)}>
            <div style={s.cardMonoRow}>
              <span style={s.cardMonoDot} />
              <span style={s.cardMonoText}>Skill Coverage</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={52} outerRadius={76}
                    dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
                    <Cell fill={T.accent} style={{ filter: `drop-shadow(0 0 10px ${T.accent}66)` }} />
                    <Cell fill="#1a2030" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
                {chartData.map((d, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: T.textSec }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: i === 0 ? T.accent : "#1a2030", border: i === 1 ? `1px solid ${T.border}` : "none", display: "inline-block" }} />
                    {d.name}
                  </span>
                ))}
              </div>
              {/* score percentage label */}
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, color: T.accent, letterSpacing: "-0.03em" }}>
                  {analysis.score}%
                </span>
                <span style={{ display: "block", fontSize: 11, color: T.textMuted, letterSpacing: "0.06em", marginTop: 4 }}>
                  SKILL MATCH
                </span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ══ ROW 2: Detected Skills (full width) ══ */}
        <motion.div style={{ ...s.card, height: "auto" }} {...fadeUp(0.18)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={s.cardMonoRow}>
              <span style={s.cardMonoDot} />
              <span style={s.cardMonoText}>Detected Skills</span>
            </div>
            <span style={{ ...s.badge, background: "rgba(0,212,255,0.08)", borderColor: "rgba(0,212,255,0.25)", color: T.accent }}>
              {analysis.foundSkills?.length ?? 0} found
            </span>
          </div>
          <div style={s.tagCloud}>
            {analysis.foundSkills?.map((sk, i) => (
              <motion.span key={i} style={s.greenTag}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.04 }}>
                {sk}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ══ ROW 3: Missing Skills (prioritized) + Roles ══ */}
        <div style={s.row2}>

          {/* MISSING SKILLS — prioritized */}
          <motion.div style={s.card} {...fadeUp(0.2)}>
            <div style={s.cardHeaderRow}>
              <div style={s.cardMonoRow}>
                <span style={s.cardMonoDot} />
                <span style={s.cardMonoText}>Skill Gaps</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { key: "all",    label: `All (${prioritizedMissing.length})` },
                  { key: "high",   label: `🔴 ${highCount}`   },
                  { key: "medium", label: `🟡 ${medCount}`    },
                  { key: "low",    label: `⚪ ${lowCount}`    },
                ].map(tab => (
                  <motion.button
                    key={tab.key}
                    style={{
                      ...s.tabBtn,
                      background:   activeSkillTab === tab.key ? "rgba(0,212,255,0.1)"    : "transparent",
                      borderColor:  activeSkillTab === tab.key ? T.accentBorder             : T.border,
                      color:        activeSkillTab === tab.key ? T.accent                   : T.textMuted,
                    }}
                    whileHover={{ scale: 1.04 }}
                    onClick={() => setActiveSkillTab(tab.key)}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* priority legend */}
            <div style={s.priorityLegend}>
              <span style={s.legendItem}><span style={{ ...s.legendDot, background: T.red    }} />High — learn ASAP</span>
              <span style={s.legendItem}><span style={{ ...s.legendDot, background: T.amber  }} />Medium — plan for it</span>
              <span style={s.legendItem}><span style={{ ...s.legendDot, background: T.border }} />Nice to have</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkillTab}
                style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {filteredMissing.map(({ skill, priority }, i) => {
                  const pColor = priority === "high" ? T.red : priority === "medium" ? T.amber : T.textSec;
                  return (
                    <motion.div
                      key={skill}
                      style={{
                        ...s.missingRow,
                        borderLeftColor: pColor,
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ x: 4, background: pColor + "08" }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.textPri, fontFamily: T.fontDisplay }}>{skill}</span>
                      </div>
                      <PriorityTag priority={priority} />
                    </motion.div>
                  );
                })}
                {filteredMissing.length === 0 && (
                  <p style={{ fontSize: 13, color: T.textMuted, textAlign: "center", padding: "20px 0" }}>
                    No skills in this category
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* RECOMMENDED ROLES — with context */}
          <motion.div style={s.card} {...fadeUp(0.25)}>
            <div style={s.cardMonoRow}>
              <span style={s.cardMonoDot} />
              <span style={s.cardMonoText}>Recommended Roles</span>
            </div>
            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              Hover each role to see what it involves. Sorted by match strength.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {analysis.recommendations?.map((role, i) => (
                <RoleCard key={i} role={role} index={i} careerPath={analysis.careerPath} />
              ))}
            </div>
          </motion.div>

        </div>

        {/* ══ ROW 4: AI Insights ══ */}
        <motion.div style={{ ...s.card, ...s.insightCardWide }} {...fadeUp(0.3)}>
          <div style={s.insightTop}>
            <div style={s.cardMonoRow}>
              <span style={s.cardMonoDot} />
              <span style={s.cardMonoText}>AI Insights</span>
            </div>
            <div style={s.insightBadge}>
              <motion.span
                style={s.insightDot}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
Groq · Llama 3.3
            </div>
          </div>

          <div style={s.insightGrid}>
            {/* main insight text */}
            <div style={s.insightTextBox}>
              <p style={s.insightText}>{analysis.insights}</p>
            </div>

            {/* quick stats column */}
            <div style={s.insightStats}>
              {[
                { label: "Skills Found",    val: analysis.foundSkills?.length ?? 0,   color: T.accent  },
                { label: "Skill Gaps",      val: analysis.missingSkills?.length ?? 0, color: T.red    },
                { label: "High Priority",   val: highCount,                            color: T.red    },
                { label: "Roles Matched",   val: analysis.recommendations?.length ?? 0, color: T.blue },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  style={s.insightStatItem}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <span style={{ fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 800, color: stat.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {stat.val}
                  </span>
                  <span style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: 3 }}>
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", background: T.bgDeep, color: T.textPri,
    fontFamily: T.fontBody, position: "relative", overflow: "hidden",
  },
  gridOverlay: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: `linear-gradient(rgba(0,212,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.022) 1px, transparent 1px)`,
    backgroundSize: "64px 64px",
  },

  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 36px",
    borderBottom: `1px solid ${T.border}`,
    background: "rgba(3,4,10,0.90)", backdropFilter: "blur(22px)",
    position: "sticky", top: 0, zIndex: 100,
  },
  topBarLeft:    { display: "flex", alignItems: "center", gap: 14 },
  logoMark:      { cursor: "pointer" },
  topBarDivider: { width: 1, height: 20, background: T.border },
  topBarTitle:   { fontFamily: T.fontDisplay, fontSize: 11, color: T.textSec, letterSpacing: "0.08em" },
  scorePill: {
    fontSize: 11, fontWeight: 700, fontFamily: T.fontDisplay,
    padding: "5px 14px", borderRadius: 100, border: "1px solid",
    letterSpacing: "0.04em",
  },
  ghostBtn: {
    padding: "8px 16px", border: `1px solid ${T.border}`, borderRadius: "7px",
    background: "transparent", color: T.textSec, fontSize: 12, fontWeight: 500,
    cursor: "pointer", fontFamily: T.fontBody,
  },
  greenBtn: {
    padding: "9px 18px", border: `1px solid ${T.accentBorder}`, borderRadius: "7px",
    background: T.accentDim, color: T.accent, fontSize: 12, fontWeight: 700,
    cursor: "pointer", fontFamily: T.fontBody, letterSpacing: "0.02em",
  },

  main: {
    padding: "24px 36px 56px", maxWidth: 1400,
    margin: "0 auto", position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column", gap: 18,
  },
  row3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 },
  row2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 },

  card: {
    background: "rgba(13,21,38,0.88)",
    backdropFilter: "blur(20px)", border: `1px solid ${T.border}`,
    borderRadius: "16px", padding: "24px",
    display: "flex", flexDirection: "column",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    transition: "border-color 0.25s",
  },
  scoreCardAccent: {
    borderColor: "rgba(0,212,255,0.12)",
    boxShadow: "0 0 50px rgba(0,212,255,0.05), 0 4px 24px rgba(0,0,0,0.3)",
  },
  cardMono: {
    fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700,
    color: T.accent, letterSpacing: "0.12em",
    textTransform: "uppercase", marginBottom: 16,
  },
  cardMonoRow: {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 0,
  },
  cardMonoDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: T.accent, display: "inline-block", flexShrink: 0,
    boxShadow: `0 0 6px ${T.accent}`,
  },
  cardMonoText: {
    fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700,
    color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase",
  },
  cardHeaderRow: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap", gap: 8,
    marginBottom: 16,
  },

  /* Small count badge */
  countBadge: {
    fontSize: 11, fontWeight: 700,
    padding: "3px 12px", borderRadius: 100,
    border: "1px solid", letterSpacing: "0.04em",
    fontFamily: T.fontDisplay,
  },

  badge: {
    fontSize: 11, fontWeight: 600, padding: "5px 14px",
    borderRadius: 100, border: "1px solid", letterSpacing: "0.04em",
  },

  /* career bars */
  careerTitle: {
    fontFamily: T.fontBody, fontSize: "clamp(16px,2.2vw,22px)", fontWeight: 800,
    color: T.accent, textAlign: "center", letterSpacing: "-0.02em", lineHeight: 1.2,
    marginBottom: 4,
  },
  metaRow: {
    display: "flex", borderTop: `1px solid ${T.border}`,
    paddingTop: 14, marginTop: 16,
  },

  /* tags */
  tagCloud: { display: "flex", flexWrap: "wrap", gap: 6 },
  greenTag: {
    fontSize: 11, fontWeight: 600, fontFamily: T.fontDisplay,
    padding: "4px 10px", borderRadius: "5px",
    background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.18)",
    color: T.accent, letterSpacing: "0.02em",
  },

  /* missing skills */
  tabBtn: {
    padding: "4px 10px", borderRadius: "6px",
    border: "1px solid", fontSize: 11, fontWeight: 600,
    cursor: "pointer", fontFamily: T.fontDisplay, letterSpacing: "0.02em",
    transition: "all 0.2s",
  },
  priorityLegend: { display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 },
  legendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.textMuted },
  legendDot:  { width: 7, height: 7, borderRadius: 2, display: "inline-block", flexShrink: 0 },
  missingRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "11px 14px",
    borderRadius: "8px",
    border: `1px solid ${T.border}`,
    borderLeft: "3px solid",
    background: "rgba(255,255,255,0.01)",
    transition: "all 0.2s", cursor: "default",
  },

  /* roles */
  roleCard: {
    display: "flex", alignItems: "flex-start", gap: 13,
    padding: "13px 14px", borderRadius: "10px",
    border: `1px solid`,
    transition: "all 0.2s", cursor: "default",
    overflow: "hidden",
  },
  roleIcon: {
    width: 36, height: 36, borderRadius: "8px",
    border: "1px solid", fontSize: 15,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, fontFamily: T.fontBody,
  },
  roleName: { fontSize: 14, fontWeight: 700, color: T.textPri, letterSpacing: "-0.01em" },
  roleDesc: { fontSize: 12, color: T.textSec, lineHeight: 1.55, fontWeight: 300, marginTop: 4 },

  /* insights */
  insightCardWide: { borderColor: "rgba(0,212,255,0.08)" },
  insightTop: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  insightBadge: {
    display: "flex", alignItems: "center", gap: 7,
    fontFamily: T.fontDisplay, fontSize: 10, color: T.textMuted,
    letterSpacing: "0.07em",
  },
  insightDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: T.accent, display: "inline-block",
    boxShadow: `0 0 6px ${T.accent}`,
  },
  insightGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 24,
    alignItems: "start",
  },
  insightTextBox: {
    background: "rgba(0,212,255,0.03)",
    border: "1px solid rgba(0,212,255,0.08)",
    borderRadius: "10px", padding: "18px",
  },
  insightText: {
    fontSize: 14, lineHeight: 1.85,
    color: T.textSec, fontWeight: 300,
  },
  insightStats: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 12, minWidth: 200,
  },
  insightStatItem: {
    background: T.bgDeep, border: `1px solid ${T.border}`,
    borderRadius: "10px", padding: "14px 16px",
    display: "flex", flexDirection: "column", gap: 4,
  },
};