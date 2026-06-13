const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    foundSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    careerPath: {
      type: String,
      required: true,
    },
    recommendations: {
      type: [String],
      default: [],
    },
    insights: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Analysis", AnalysisSchema);