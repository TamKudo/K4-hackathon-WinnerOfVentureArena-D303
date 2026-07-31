import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync, readdirSync } from "fs";
import { generateReviewMap } from "../../lib/reviewMapGenerator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..", "..", "..");
const TRANSCRIPT_DIR = path.join(REPO_ROOT, "data", "vlearn-pack", "transcript");
const DATA = JSON.parse(
  readFileSync(path.join(__dirname, "data", "lessons.json"), "utf8")
);

const MIN_BY_TIER = { core: 5, important: 4, supporting: 3 };

// order/estimated_minutes không phải quyết định của AI — chỉ phục vụ sắp xếp UI
// (cùng quy ước với codebase/wire-ai-output-to-ui.mjs).
function withUiFields(concepts) {
  const orderCounter = { core: 0, important: 0, supporting: 0 };
  return concepts.map((c) => {
    orderCounter[c.tier] = (orderCounter[c.tier] || 0) + 1;
    return {
      ...c,
      order: orderCounter[c.tier],
      estimated_minutes: MIN_BY_TIER[c.tier] ?? 4,
    };
  });
}

function countByTier(concepts) {
  const counts = { total: 0, core: 0, important: 0, supporting: 0 };
  for (const c of concepts) {
    counts.total += 1;
    counts[c.tier] = (counts[c.tier] || 0) + 1;
  }
  return counts;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Danh sách transcript có sẵn trong data pack — dùng cho màn "Demo trực tiếp" (POST /api/generate).
// Chỉ liệt kê từ đúng thư mục data/ đã cấp cho hackathon, không nhận transcript tự do từ client
// (giữ chi phí/token Groq trong tầm kiểm soát — free tier đã từng hết quota, xem eval/run-3/trace.json).
app.get("/api/transcripts", (_req, res) => {
  const files = readdirSync(TRANSCRIPT_DIR).filter((f) => f.endsWith(".md") && f !== "README.md");
  res.json(files.map((f) => ({ id: f.replace(/\.md$/, ""), fileName: f })));
});

// Lời gọi AI thật, chạy live — dùng cho case chưa có sẵn trong server/data/lessons.json
// (vd. giám khảo chọn 1 transcript lạ tại CP6). Không ghi đè lessons.json, chỉ trả kết quả
// của riêng lượt gọi này — mỗi lần bấm là một lần gọi AI thật mới, không cache.
let generating = false;
app.post("/api/generate", async (req, res) => {
  if (generating) {
    return res.status(429).json({ error: "Đang có một lượt sinh Review Map khác chạy — đợi lượt đó xong rồi thử lại." });
  }
  const { transcriptId } = req.body || {};
  const fileName = `${transcriptId}.md`;
  const transcriptPath = path.join(TRANSCRIPT_DIR, fileName);
  if (!transcriptId || !existsSync(transcriptPath)) {
    return res.status(400).json({ error: "transcriptId không hợp lệ — phải là một id từ GET /api/transcripts." });
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server thiếu GROQ_API_KEY — không gọi được AI thật." });
  }

  generating = true;
  const log = [];
  try {
    const transcriptText = readFileSync(transcriptPath, "utf8");
    const { concepts, segments, citationCheck } = await generateReviewMap({
      transcriptText,
      apiKey,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      chunkSize: Number(process.env.CHUNK_SIZE || 18),
      maxCore: Number(process.env.MAX_CORE || 5),
      maxRetries: 3, // live/demo: fail nhanh hơn CLI (mặc định 8) để không bắt người xem chờ quá lâu
      onProgress: (msg) => log.push(msg),
    });
    const uiConcepts = withUiFields(concepts);
    res.json({
      id: `live:${transcriptId}`,
      title: `Lượt AI thật — ${fileName}`,
      subtitle: "Sinh trực tiếp lúc demo, không phải dữ liệu có sẵn",
      disclaimer: "Bản đồ ưu tiên ôn theo nội dung bài giảng — không phải dự đoán đề thi",
      transcript_source: fileName,
      counts: countByTier(uiConcepts),
      segments,
      concepts: uiConcepts,
      citationCheck,
      data_source: `Lời gọi AI thật qua Groq lúc ${new Date().toISOString()} — xem spec.md §7`,
      log,
    });
  } catch (e) {
    res.status(502).json({ error: e.message, log });
  } finally {
    generating = false;
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
