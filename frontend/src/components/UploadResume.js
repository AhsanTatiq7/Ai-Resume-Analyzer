import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const T = {
  bgDeep:      "#03040a",
  accent:      "#00d4ff",
  accentGlow:  "rgba(0,212,255,0.35)",
  accentBorder:"rgba(0,212,255,0.28)",
  textPri:     "#f0f4ff",
  textSec:     "#8899b0",
  textMuted:   "#4a5568",
  border:      "rgba(255,255,255,0.07)",
  fontDisplay: "'Syne', sans-serif",
  fontBody:    "'DM Sans', sans-serif",
};

export default function UploadResume() {
  const navigate = useNavigate();
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    document.title = "Upload Resume — CareerForge";
    return () => { document.title = "CareerForge — AI Resume Analyzer"; };
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError(null);
    } else {
      setError("Only PDF files are accepted. Please upload a .pdf file.");
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API}/api/resume/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard", { state: { analysis: res.data.analysis } });
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div style={s.page}>

      <div style={s.gridOverlay} />
      <div style={{ ...s.orb, top: -220, left: -220, background: "rgba(0,212,255,0.07)" }} />
      <div style={{ ...s.orb, bottom: -160, right: -160, background: "rgba(124,77,255,0.08)" }} />

      {/* back */}
      <motion.div style={s.backLink}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={() => navigate("/")} whileHover={{ color: T.accent }}>
        ← Back to Home
      </motion.div>

      <div style={s.center}>

        <motion.div style={{ textAlign: "center", marginBottom: 40 }}
          initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p style={s.eyebrow}>Resume Analyzer</p>
          <h1 style={s.title}>Upload Your Resume</h1>
          <p style={s.subtitle}>PDF format — max 10MB. Results in under 5 seconds.</p>
        </motion.div>

        <motion.div style={s.card}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>

          <motion.div
            style={{
              ...s.dropZone,
              borderColor: dragOver ? "rgba(0,212,255,0.65)" : file ? "rgba(0,212,255,0.38)" : "rgba(255,255,255,0.1)",
              background:  dragOver ? "rgba(0,212,255,0.05)" : "rgba(255,255,255,0.015)",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            animate={dragOver ? { scale: 1.015 } : { scale: 1 }}>

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div key="empty" style={s.dropContent}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={s.dropIconWrap}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p style={s.dropTitle}>Drop your PDF here</p>
                  <p style={s.dropSub}>or click to browse files</p>
                  <label style={s.browseBtn}>
                    Choose File
                    <input type="file" accept=".pdf" style={{ display: "none" }}
                      onChange={(e) => {
                      const selected = e.target.files[0];
                      if (selected && selected.type === "application/pdf") {
                        setFile(selected);
                        setError(null);
                      } else if (selected) {
                        setError("Only PDF files are accepted. Please upload a .pdf file.");
                      }
                    }} />
                  </label>
                </motion.div>
              ) : (
                <motion.div key="file" style={s.fileRow}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <div style={s.fileIconWrap}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.fileName}>{file.name}</p>
                    <p style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB · PDF</p>
                  </div>
                  <button style={s.removeBtn}
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}>✕</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.button
            style={{ ...s.analyzeBtn, opacity: file ? 1 : 0.38, cursor: file ? "pointer" : "not-allowed" }}
            whileHover={file ? { scale: 1.03, boxShadow: `0 0 30px ${T.accentGlow}` } : {}}
            whileTap={file ? { scale: 0.98 } : {}}
            onClick={handleUpload} disabled={!file || loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <motion.span style={s.spinner}
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }} />
                Analyzing Resume...
              </span>
            ) : "Analyze Resume"}
          </motion.button>

          <div style={s.trustRow}>
            {["Secure upload", "No data stored", "Instant results"].map((t, i) => (
              <span key={i} style={s.trustItem}>
                <span style={s.trustDot} /> {t}
              </span>
            ))}
          </div>

          {/* Inline error message */}
          {error && (
            <motion.div
              style={s.errorBox}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span style={s.errorDot} />
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", background: T.bgDeep, color: T.textPri,
    fontFamily: T.fontBody, display: "flex", flexDirection: "column",
    alignItems: "center", position: "relative", overflow: "hidden", padding: "24px 20px",
  },
  gridOverlay: {
    position: "fixed", inset: 0,
    backgroundImage: `linear-gradient(rgba(0,212,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.022) 1px, transparent 1px)`,
    backgroundSize: "64px 64px", pointerEvents: "none", zIndex: 0,
  },
  orb: { position: "fixed", width: 460, height: 460, borderRadius: "50%", filter: "blur(110px)", pointerEvents: "none", zIndex: 0 },
  backLink: {
    alignSelf: "flex-start", fontSize: 13, color: T.textMuted,
    cursor: "pointer", padding: "8px 4px", fontWeight: 500,
    position: "relative", zIndex: 1, transition: "color 0.2s", fontFamily: T.fontBody,
  },
  center: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    width: "100%", maxWidth: 520, position: "relative", zIndex: 1, paddingTop: 32,
  },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.accent, marginBottom: 12 },
  title:    { fontFamily: T.fontDisplay, fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10, color: T.textPri },
  subtitle: { fontSize: 14, color: T.textSec, fontWeight: 300 },
  card: {
    width: "100%", background: "rgba(13,21,38,0.92)", backdropFilter: "blur(24px)",
    border: `1px solid ${T.border}`, borderRadius: "26px", padding: "32px",
    boxShadow: "0 0 60px rgba(0,0,0,0.5)",
  },
  dropZone: {
    borderRadius: "16px", border: "1px dashed", transition: "all 0.22s ease",
    minHeight: 210, display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 22, padding: "28px 24px",
  },
  dropContent: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  dropIconWrap: {
    width: 54, height: 54, borderRadius: 13,
    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: T.accent, marginBottom: 6,
  },
  dropTitle: { fontSize: 15, fontWeight: 600, color: T.textPri, letterSpacing: "-0.01em" },
  dropSub:   { fontSize: 13, color: T.textMuted, marginBottom: 14 },
  browseBtn: {
    padding: "9px 20px", border: `1px solid ${T.accentBorder}`, borderRadius: "8px",
    background: "rgba(0,212,255,0.06)", color: T.accent, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: T.fontBody, display: "inline-block", letterSpacing: "0.04em",
  },
  fileRow:     { display: "flex", alignItems: "center", gap: 14, width: "100%" },
  fileIconWrap: {
    width: 46, height: 46, borderRadius: 11,
    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: T.accent, flexShrink: 0,
  },
  fileName: { fontSize: 14, fontWeight: 600, color: T.textPri, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  fileSize: { fontSize: 12, color: T.textMuted, marginTop: 2 },
  removeBtn: {
    marginLeft: "auto", width: 28, height: 28, borderRadius: 6,
    border: `1px solid ${T.border}`, background: "transparent",
    color: T.textMuted, cursor: "pointer", fontSize: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: T.fontBody, flexShrink: 0,
  },
  analyzeBtn: {
    width: "100%", padding: "14px", border: "none", borderRadius: "12px",
    background: T.accent, color: "#000", cursor: "pointer",
    fontWeight: 700, fontSize: 14, letterSpacing: "0.02em",
    fontFamily: T.fontBody, marginBottom: 18, transition: "opacity 0.2s",
  },
  spinner: {
    display: "inline-block", width: 15, height: 15,
    border: "2px solid rgba(0,0,0,0.15)", borderTop: "2px solid #000", borderRadius: "50%",
  },
  trustRow:  { display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" },

  errorBox: {
    marginTop: 16,
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 16px", borderRadius: "10px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    fontSize: 13, color: "#ef4444",
    fontWeight: 500, lineHeight: 1.5,
  },
  errorDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#ef4444", flexShrink: 0,
    display: "inline-block",
  },
  trustItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted, fontWeight: 400 },
  trustDot:  { width: 5, height: 5, borderRadius: "50%", background: "rgba(0,212,255,0.5)", display: "inline-block", flexShrink: 0 },
};