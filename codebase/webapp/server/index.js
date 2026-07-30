import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = JSON.parse(
  readFileSync(path.join(__dirname, "data", "lessons.json"), "utf8")
);

const app = express();
app.use(cors());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

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
