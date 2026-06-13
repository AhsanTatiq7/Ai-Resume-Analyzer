const express   = require("express");
const multer    = require("multer");
const fs        = require("fs");
const path      = require("path");
const pdfParse  = require("pdf-parse");
const aiEngine  = require("../utils/aiEngine");
const Analysis  = require("../models/Analysis");

const router = express.Router();

// ══════════════════════════════════════
// MULTER CONFIG — PDF only, 10MB max
// ══════════════════════════════════════
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File too large. Maximum size is 10MB." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
}

function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.warn("Could not delete temp file:", e.message);
  }
}

// ══════════════════════════════════════
// TEST ROUTE
// ══════════════════════════════════════
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Resume route working" });
});

// ══════════════════════════════════════
// UPLOAD + ANALYZE — saves to MongoDB
// ══════════════════════════════════════
router.post(
  "/upload",
  (req, res, next) => upload.single("resume")(req, res, (err) => handleMulterError(err, req, res, next)),
  async (req, res) => {
    const filePath = req.file?.path;

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
      }

      // Parse PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData    = await pdfParse(dataBuffer);
      const extractedText = pdfData.text?.trim();

      // Delete temp file immediately
      cleanupFile(filePath);

      if (!extractedText || extractedText.length < 50) {
        return res.status(422).json({
          success: false,
          message: "Could not extract text from this PDF. Please upload a text-based resume.",
        });
      }

      // AI analysis
      const analysis = await aiEngine.analyzeResume(extractedText);

      // ── Save to MongoDB ──
      const saved = await Analysis.create({
        fileName:        req.file.originalname,
        fileSize:        req.file.size,
        score:           analysis.score,
        foundSkills:     analysis.foundSkills,
        missingSkills:   analysis.missingSkills,
        careerPath:      analysis.careerPath,
        recommendations: analysis.recommendations,
        insights:        analysis.insights,
      });

      return res.status(200).json({
        success: true,
        message: "Resume analyzed successfully",
        fileInfo: {
          originalName: req.file.originalname,
          size:         req.file.size,
        },
        analysis: {
          id:              saved._id, // MongoDB ID for reference
          score:           analysis.score,
          foundSkills:     analysis.foundSkills,
          missingSkills:   analysis.missingSkills,
          careerPath:      analysis.careerPath,
          recommendations: analysis.recommendations,
          insights:        analysis.insights,
        },
      });

    } catch (error) {
      cleanupFile(filePath);
      console.error("Resume analysis error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Something went wrong while processing your resume. Please try again.",
      });
    }
  }
);

// ══════════════════════════════════════
// GET ALL HISTORY — newest first
// ══════════════════════════════════════
router.get("/history", async (req, res) => {
  try {
    const history = await Analysis.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(20)               // last 20 analyses
      .select("-__v");         // hide mongoose version field

    return res.status(200).json({
      success: true,
      count:   history.length,
      history,
    });
  } catch (error) {
    console.error("History fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not fetch history.",
    });
  }
});

// ══════════════════════════════════════
// GET SINGLE ANALYSIS BY ID
// ══════════════════════════════════════
router.get("/history/:id", async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).select("-__v");

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found." });
    }

    return res.status(200).json({ success: true, analysis });

  } catch (error) {
    console.error("Single analysis fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not fetch analysis.",
    });
  }
});

// ══════════════════════════════════════
// DELETE SINGLE ANALYSIS BY ID
// ══════════════════════════════════════
router.delete("/history/:id", async (req, res) => {
  try {
    const deleted = await Analysis.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Analysis not found." });
    }

    return res.status(200).json({ success: true, message: "Analysis deleted successfully." });

  } catch (error) {
    console.error("Delete error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not delete analysis.",
    });
  }
});


// ══════════════════════════════════════
// GET LIVE STATS — for home page hero card
// ══════════════════════════════════════
router.get("/stats", async (req, res) => {
  try {
    const totalResumes = await Analysis.countDocuments();

    // average score across all analyses
    const scoreAgg = await Analysis.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);
    const avgScore = scoreAgg.length > 0
      ? Math.round(scoreAgg[0].avgScore)
      : 0;

    // most common career path
    const pathAgg = await Analysis.aggregate([
      { $group: { _id: "$careerPath", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const topCareerPath = pathAgg.length > 0
      ? pathAgg[0]._id
      : "Full Stack Development";

    // most recent analysis for live preview card
    const latest = await Analysis.findOne()
      .sort({ createdAt: -1 })
      .select("score careerPath foundSkills fileName createdAt");

    return res.status(200).json({
      success: true,
      stats: {
        totalResumes,
        avgScore,
        topCareerPath,
        latest: latest || null,
      },
    });

  } catch (error) {
    console.error("Stats fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not fetch stats.",
    });
  }
});


module.exports = router;