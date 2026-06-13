import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ScoreBadge({ score }) {
  const color = score >= 75 ? T.accent : score >= 50 ? T.amber : T.red;
  return (
    <span style={{
      fontSize: 12, fontWeight: 700,
      padding: "4px 12px", borderRadius: 100,
      border: `1px solid ${color}44`,
      background: `${color}11`,
      color,
      letterSpacing: "0.03em",
      flexShrink: 0,
    }}>
      {score}%
    </span>
  );
}

function SkeletonCard() {
  return (
    <div style={{ ...s.card, padding: "24px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.05)", marginBottom: 12, width: i === 3 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    document.title = "History — CareerForge";
    fetchHistory();
    return () => { document.title = "CareerForge — AI Resume Analyzer"; };
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API}/api/resume/history`);
      setHistory(res.data.history || []);
    } catch {
      setError("Could not load history. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this analysis?")) return;
    try {
      setDeleting(id);
      await axios.delete(`${API}/api/resume/history/${id}`);
      setHistory((prev) => prev.filter((h) => h._id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      alert("Could not delete. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleViewDashboard = (item) => {
    navigate("/dashboard", {
      state: {
        analysis: {
          score:           item.score,
          foundSkills:     item.foundSkills,
          missingSkills:   item.missingSkills,
          careerPath:      item.careerPath,
          recommendations: item.recommendations,
          insights:        item.insights,
        },
      },
    });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={s.page}>

      <div style={s.gridOverlay} />
      <div style={{ ...s.orb, top: -200, left: -200, background: "rgba(0,212,255,0.06)" }} />
      <div style={{ ...s.orb, bottom: -200, right: -200, background: "rgba(124,77,255,0.07)" }} />

      {/* ── TOP BAR ── */}
      <motion.header
        style={s.topBar}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={s.topBarLeft}>
          <div style={s.logoMark} onClick={() => navigate("/")}>CF</div>
          <p style={s.topBarTitle}>{'// RESUME_HISTORY'}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <motion.button
            style={s.ghostBtn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
          >
            Home
          </motion.button>
          <motion.button
            style={s.accentBtn}
            whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${T.accentGlow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/upload")}
          >
            New Analysis
          </motion.button>
        </div>
      </motion.header>

      <main style={s.main}>

        {/* ── HEADER ROW ── */}
        <motion.div
          style={s.pageHeader}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p style={s.eyebrow}>Analysis History</p>
            <h1 style={s.pageTitle}>Your Resume Analyses</h1>
            <p style={s.pageSub}>Click any entry to expand details or view the full dashboard.</p>
          </div>

          {/* summary chips */}
          {!loading && !error && history.length > 0 && (
            <div style={s.summaryChips}>
              <div style={s.chip}>
                <span style={s.chipNum}>{history.length}</span>
                <span style={s.chipLbl}>Total Analyses</span>
              </div>
              <div style={s.chip}>
                <span style={{ ...s.chipNum, color: T.accent }}>
                  {Math.round(history.reduce((a, b) => a + b.score, 0) / history.length)}%
                </span>
                <span style={s.chipLbl}>Avg Score</span>
              </div>
              <div style={s.chip}>
                <span style={{ ...s.chipNum, color: T.accent }}>
                  {history.filter(h => h.score >= 75).length}
                </span>
                <span style={s.chipLbl}>Strong Profiles</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <motion.div
            style={s.errorBox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p style={{ fontSize: 14, color: T.red, marginBottom: 12 }}>{error}</p>
            <button style={s.accentBtn} onClick={fetchHistory}>Retry</button>
          </motion.div>
        )}

        {/* ── EMPTY ── */}
        {!loading && !error && history.length === 0 && (
          <motion.div
            style={s.emptyBox}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
              No analyses yet
            </p>
            <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>
              Upload your first resume to get started.
            </p>
            <motion.button
              style={s.accentBtn}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/upload")}
            >
              Analyze a Resume
            </motion.button>
          </motion.div>
        )}

        {/* ── LIST ── */}
        {!loading && !error && history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AnimatePresence>
              {history.map((item, i) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  {/* ── ROW ── */}
                  <div
                    style={{
                      ...s.card,
                      borderColor: expanded === item._id
                        ? "rgba(0,212,255,0.25)"
                        : T.border,
                      cursor: "pointer",
                    }}
                    onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                  >
                    <div style={s.cardRow}>

                      {/* index */}
                      <span style={s.rowIndex}>
                        {String(history.length - i).padStart(2, "0")}
                      </span>

                      {/* file info */}
                      <div style={s.fileInfo}>
                        <p style={s.fileName}>{item.fileName}</p>
                        <p style={s.fileDate}>{formatDate(item.createdAt)}</p>
                      </div>

                      {/* career path */}
                      <span style={s.careerBadge}>{item.careerPath}</span>

                      {/* score */}
                      <ScoreBadge score={item.score} />

                      {/* actions */}
                      <div style={s.actions} onClick={(e) => e.stopPropagation()}>
                        <motion.button
                          style={s.viewBtn}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewDashboard(item)}
                        >
                          View
                        </motion.button>
                        <motion.button
                          style={s.deleteBtn}
                          whileHover={{ scale: 1.05, background: "rgba(255,77,109,0.15)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleDelete(item._id, e)}
                          disabled={deleting === item._id}
                        >
                          {deleting === item._id ? "..." : "Delete"}
                        </motion.button>
                      </div>

                      {/* expand arrow */}
                      <motion.span
                        style={s.arrow}
                        animate={{ rotate: expanded === item._id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ▾
                      </motion.span>

                    </div>

                    {/* ── EXPANDED DETAILS ── */}
                    <AnimatePresence>
                      {expanded === item._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={s.expandedContent}>

                            {/* found skills */}
                            <div style={s.expandSection}>
                              <p style={s.expandLabel}>Found Skills</p>
                              <div style={s.tagCloud}>
                                {item.foundSkills.map((sk, j) => (
                                  <span key={j} style={s.greenTag}>{sk}</span>
                                ))}
                              </div>
                            </div>

                            {/* missing skills */}
                            <div style={s.expandSection}>
                              <p style={s.expandLabel}>Missing Skills</p>
                              <div style={s.tagCloud}>
                                {item.missingSkills.map((sk, j) => (
                                  <span key={j} style={s.redTag}>{sk}</span>
                                ))}
                              </div>
                            </div>

                            {/* insights */}
                            <div style={s.expandSection}>
                              <p style={s.expandLabel}>AI Insights</p>
                              <p style={s.insightText}>{item.insights}</p>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </main>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: T.bgDeep,
    color: T.textPri,
    fontFamily: T.fontBody,
    position: "relative",
    overflow: "hidden",
  },
  gridOverlay: {
    position: "fixed", inset: 0,
    backgroundImage: `linear-gradient(rgba(0,212,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.018) 1px, transparent 1px)`,
    backgroundSize: "64px 64px",
    pointerEvents: "none", zIndex: 0,
  },
  orb: {
    position: "fixed", width: 460, height: 460,
    borderRadius: "50%", filter: "blur(120px)",
    pointerEvents: "none", zIndex: 0,
  },

  /* top bar */
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 40px",
    borderBottom: `1px solid ${T.border}`,
    background: "rgba(3,4,10,0.88)",
    backdropFilter: "blur(22px)",
    position: "sticky", top: 0, zIndex: 100,
  },
  topBarLeft: { display: "flex", alignItems: "center", gap: 13 },
  logoMark: {
    fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14,
    color: T.accent, cursor: "pointer", letterSpacing: "0.05em",
  },
  topBarTitle: { fontFamily: T.fontDisplay, fontSize: 12, color: T.textSec, letterSpacing: "0.04em" },

  ghostBtn: {
    padding: "8px 16px",
    border: `1px solid ${T.border}`,
    borderRadius: "7px",
    background: "transparent",
    color: T.textSec, fontSize: 12, fontWeight: 500,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  accentBtn: {
    padding: "8px 18px",
    border: `1px solid rgba(0,212,255,0.25)`,
    borderRadius: "7px",
    background: "rgba(0,212,255,0.08)", color: "#00d4ff",
    fontSize: 12, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },

  /* main */
  main: {
    padding: "40px 40px 60px",
    maxWidth: 1100, margin: "0 auto",
    position: "relative", zIndex: 1,
  },

  /* page header */
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 24,
    marginBottom: 36,
  },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.accent, marginBottom: 8 },
  pageTitle: { fontFamily: T.fontDisplay, fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 },
  pageSub: { fontSize: 14, color: T.textSec, fontWeight: 300 },

  /* summary chips */
  summaryChips: { display: "flex", gap: 12, flexWrap: "wrap" },
  chip: {
    background: "rgba(13,21,38,0.88)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${T.border}`,
    borderRadius: "14px",
    padding: "14px 20px",
    textAlign: "center",
    minWidth: 90,
  },
  chipNum: { display: "block", fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: T.textPri, lineHeight: 1.1 },
  chipLbl: { display: "block", fontSize: 10, color: T.textMuted, letterSpacing: "0.06em", marginTop: 4, textTransform: "uppercase" },

  /* cards */
  card: {
    background: "rgba(13,21,38,0.88)",
    backdropFilter: "blur(24px)",
    border: `1px solid ${T.border}`,
    borderRadius: "16px",
    padding: "18px 22px",
    transition: "border-color 0.2s",
  },
  cardRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  rowIndex: {
    fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700,
    color: T.textMuted, letterSpacing: "0.06em", flexShrink: 0, width: 24,
  },
  fileInfo: { flex: 1, minWidth: 140 },
  fileName: { fontSize: 14, fontWeight: 600, color: T.textPri, letterSpacing: "-0.01em", marginBottom: 2 },
  fileDate: { fontSize: 11, color: T.textMuted },
  careerBadge: {
    fontSize: 11, fontWeight: 600,
    padding: "4px 12px", borderRadius: 100,
    background: "rgba(0,212,255,0.08)",
    border: `1px solid rgba(0,212,255,0.2)`,
    color: T.accent, letterSpacing: "0.03em",
    flexShrink: 0,
  },
  actions: { display: "flex", gap: 8, flexShrink: 0 },
  viewBtn: {
    padding: "6px 14px", borderRadius: "7px",
    border: `1px solid ${T.accentBorder}`,
    background: "transparent", color: T.accent,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    fontFamily: T.fontBody,
  },
  deleteBtn: {
    padding: "6px 14px", borderRadius: "7px",
    border: "1px solid rgba(255,77,109,0.25)",
    background: "transparent", color: T.red,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    fontFamily: T.fontBody, transition: "background 0.2s",
  },
  arrow: { fontSize: 14, color: T.textMuted, flexShrink: 0, display: "inline-block" },

  /* expanded */
  expandedContent: {
    borderTop: `1px solid ${T.border}`,
    marginTop: 16, paddingTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  expandSection: {},
  expandLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: T.textMuted, marginBottom: 10,
  },
  tagCloud: { display: "flex", flexWrap: "wrap", gap: 6 },
  greenTag: {
    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.22)",
    color: T.accent,
  },
  redTag: {
    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
    background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.22)",
    color: T.red,
  },
  insightText: { fontSize: 13, lineHeight: 1.8, color: T.textSec, fontWeight: 300, fontFamily: "'DM Sans', sans-serif" },

  /* empty / error */
  emptyBox: {
    background: "rgba(13,21,38,0.88)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${T.border}`,
    borderRadius: "20px",
    padding: "60px 40px",
    textAlign: "center",
  },
  errorBox: {
    background: "rgba(255,77,109,0.05)",
    border: "1px solid rgba(255,77,109,0.2)",
    borderRadius: "16px",
    padding: "32px",
    textAlign: "center",
  },
};