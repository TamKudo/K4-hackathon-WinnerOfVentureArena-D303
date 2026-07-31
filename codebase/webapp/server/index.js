import { spawn } from "node:child_process";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = JSON.parse(
  readFileSync(path.join(__dirname, "data", "lessons.json"), "utf8")
);
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const REVIEW_MAP_PATH = path.join(REPO_ROOT, "eval", "run-3", "ai-output.json");
const REVIEW_MAP_GENERATOR = path.join(REPO_ROOT, "codebase", "generate-review-map.mjs");

const MAX_ATTACHMENT_CHARS = 12_000;
const MAX_REVIEW_MAP_CHARS = 5_000;
const MAX_CONTEXT_CHARS = 14_000;

function truncateText(text, maxChars) {
  if (typeof text !== "string") return "";
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}\n\n[Truncated for size limits]`;
}

function buildReviewMapContext(reviewMap) {
  const concepts = reviewMap?.concepts || [];
  if (!concepts.length) return "";

  const lines = ["Review map generated from the lecture transcript:"];
  for (const concept of concepts.slice(0, 10)) {
    const tier = concept.tier || "supporting";
    const summary = concept.short_summary || concept.name || "";
    lines.push(`- ${concept.name} [${tier}] ${summary}`);
  }
  if (concepts.length > 10) lines.push(`- ... (${concepts.length - 10} more concepts omitted)`);
  return truncateText(lines.join("\n"), MAX_REVIEW_MAP_CHARS);
}

async function loadOrGenerateReviewMap(force = false) {
  if (!force && existsSync(REVIEW_MAP_PATH)) {
    return JSON.parse(readFileSync(REVIEW_MAP_PATH, "utf8"));
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable. Set it before generating the review map.");
  }

  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [REVIEW_MAP_GENERATOR], {
      cwd: REPO_ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr.trim() || stdout.trim() || "Review map generation failed."));
      }
      try {
        resolve(JSON.parse(readFileSync(REVIEW_MAP_PATH, "utf8")));
      } catch (error) {
        reject(new Error(`Review map generated but could not be parsed: ${error.message}`));
      }
    });
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Tệp tải lên quá lớn. Vui lòng chọn file nhỏ hơn." });
  }
  next(err);
});

app.get("/api/review-map", async (req, res) => {
  try {
    const reviewMap = await loadOrGenerateReviewMap(req.query.force === "true");
    return res.json(reviewMap);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to load review map." });
  }
});

app.post("/api/groq/chat", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY environment variable." });
  }

  const { messages, model = "llama-3.3-70b-versatile", reviewMap, lessonContext, attachments = [] } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Expected a non-empty messages array." });
  }

  try {
    const reviewMapContext = buildReviewMapContext(reviewMap);
    const attachmentContext = (attachments || [])
      .filter((file) => file && typeof file.content === "string" && file.content.trim())
      .map((file) => `Attachment: ${file.name || "unknown"}\n${truncateText(file.content, MAX_ATTACHMENT_CHARS)}`)
      .join("\n\n");
    const contextPrompt = [
      "You are an expert AI Tutor for LectureFocus, designed to help students master lesson content with high depth, pedagogical clarity, and academic rigor. Avoid shallow, generic, or brief summaries.",
      "Guidelines for your responses:",
      "1. EXPLANATORY DEPTH: Provide comprehensive, detailed explanations of concepts. Explain the underlying mechanisms, the 'why' and 'how' behind ideas, and any relevant technical trade-offs or connections to other parts of the lesson. Do not skip details; make your explanations substantive and informative.",
      "2. CONCRETE EXAMPLES: Use concrete details, specific scenarios, analogies, or code/mathematical snippets from the lesson context or attachments to illustrate abstract ideas. Do not filter out useful examples.",
      "3. RESPONSE LANGUAGE: Match the language of the user's query. If the user asks in Vietnamese (standard for this app), respond in clear, natural, and standard Vietnamese. Keep technical terms precise (either explain them or list standard industry terms in English alongside Vietnamese translation).",
      attachmentContext
        ? "4. PRIMARY FOCUS (ATTACHED FILES): The user has uploaded files/attachments. You MUST treat these uploaded files/attachments as the primary source of truth, focus your explanations directly on their contents, and revolve your answers around them. Only refer to the general lesson context/review map for additional context if necessary, keeping the uploaded files as the core focus of the conversation."
        : "4. PRIMARY FOCUS (LESSON): Focus your explanations on the current lesson context and the Review Map.",
      "5. CONTEXT & CITATIONS: Strictly ground all claims in the provided context (either attachments or lesson context). When referencing information, cite specific segments, quotes, or file sources to build trust. If the context has weak or missing evidence for a query, state this clearly instead of guessing.",
      "6. FORMATTING & STRUCTURE: Structure your answer using clear Markdown headings, bold text, bullet points for lists, and syntax-highlighted code blocks. Ensure each section has sufficient explanatory depth.",
      lessonContext ? `Current lesson context: ${lessonContext}` : "",
      reviewMapContext ? `Review map context:\n${reviewMapContext}` : "",
      attachmentContext ? `Uploaded files / chat logs:\n${attachmentContext}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    const compactContextPrompt = truncateText(contextPrompt, MAX_CONTEXT_CHARS);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(compactContextPrompt ? [{ role: "system", content: compactContextPrompt }] : []),
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload?.error?.message || "Groq request failed.";
      return res.status(response.status).json({ error: message });
    }

    const reply = payload?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ error: "Groq returned an empty response." });
    }

    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to call Groq." });
  }
});

// Danh sách rút gọn cho màn Home — không kèm segments/concepts để nhẹ payload.
app.get("/api/lessons", (_req, res) => {
  const list = DATA.lessonOrder.map((id) => {
    const { id: lid, title, subtitle, disclaimer, counts } = DATA.lessons[id];
    return { id: lid, title, subtitle, disclaimer, counts };
  });
  res.json(list);
});

// Chi tiết đầy đủ (segments + concepts) cho một bài — dùng ở Lesson/Review Map/Concept Detail.
app.get("/api/lessons/:id", (req, res) => {
  const lesson = DATA.lessons[req.params.id];
  if (!lesson) return res.status(404).json({ error: "Không tìm thấy bài học này." });
  res.json(lesson);
});

// Serve bản build của client nếu có (deploy chung một service).
const clientDist = path.join(__dirname, "..", "client", "dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`LectureFocus API chạy tại http://localhost:${PORT}`);
});
