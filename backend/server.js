const express      = require("express");
const cors         = require("cors");
const dotenv       = require("dotenv");
const connectDB    = require("./config/db");
const resumeRoutes = require("./routes/resumeRoutes");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "DELETE"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use("/api/resume", resumeRoutes);

// ── Health check ──
app.get("/", (req, res) => {
  res.json({ success: true, message: "AI Resume Analyzer Backend is Running" });
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API is working perfectly" });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

// ── Start ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});