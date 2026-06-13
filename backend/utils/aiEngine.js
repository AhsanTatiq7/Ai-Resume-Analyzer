const Groq = require("groq-sdk");

// ══════════════════════════════════════
// PROMPT
// ══════════════════════════════════════
function buildPrompt(resumeText) {
  return `You are an expert technical recruiter and resume analyst. Analyze the resume below and respond ONLY with a valid JSON object — no markdown, no explanation, no backticks, no extra text whatsoever.

JSON shape (follow exactly):
{
  "score": <integer 0-100, based on skill depth, experience, and completeness>,
  "foundSkills": [<array of technical skills found — be thorough, include frameworks, languages, tools, databases, cloud services>],
  "missingSkills": [<array of 4-8 relevant skills not present that are commonly expected for the detected career path>],
  "careerPath": "<one of: Frontend Development | Backend Development | Full Stack Development | Mobile Development | DevOps & Cloud | Data Science | Software Development | Technology Professional>",
  "recommendations": [<array of 4 specific job titles that match the profile>],
  "insights": "<3-4 sentences of honest, specific career advice based on what you see in the resume — strengths, gaps, and next steps>"
}

Rules:
- score must reflect actual quality, not just skill count.
- foundSkills should be capitalized properly e.g. React, Node.js, PostgreSQL, AWS.
- missingSkills should be realistic gaps for the detected career path.
- insights must be specific to THIS resume, not generic filler.
- Return ONLY the JSON object. No other text at all.

Resume:
---
${resumeText.slice(0, 6000)}
---`;
}

// ══════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════
async function analyzeResume(extractedText) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const response = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile", // free, fast, high quality
    max_tokens:  1024,
    temperature: 0.3, // lower = more consistent JSON output
    messages: [
      {
        role:    "system",
        content: "You are a resume analysis engine. You only respond with valid JSON. Never include markdown, backticks, or any explanation.",
      },
      {
        role:    "user",
        content: buildPrompt(extractedText),
      },
    ],
  });

  // Extract the response text
  const raw = response.choices?.[0]?.message?.content?.trim();

  if (!raw) {
    throw new Error("No response received from AI. Please try again.");
  }

  // Strip any accidental markdown fences just in case
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("AI returned invalid JSON:", cleaned);
    throw new Error("AI returned an unexpected response. Please try again.");
  }

  // Validate and sanitize — frontend will never break even if AI misbehaves
  return {
    score:           clampScore(parsed.score),
    foundSkills:     toStringArray(parsed.foundSkills),
    missingSkills:   toStringArray(parsed.missingSkills),
    careerPath:      typeof parsed.careerPath === "string" && parsed.careerPath.trim()
                       ? parsed.careerPath.trim()
                       : "Technology Professional",
    recommendations: toStringArray(parsed.recommendations),
    insights:        typeof parsed.insights === "string" && parsed.insights.trim()
                       ? parsed.insights.trim()
                       : "No insights available.",
  };
}

// ── Helpers ──
function clampScore(val) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

function toStringArray(val) {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v) => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
}

module.exports = { analyzeResume };