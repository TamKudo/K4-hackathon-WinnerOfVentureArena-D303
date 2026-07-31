// Lời gọi AI thật ở quyết định trung tâm của LectureFocus: đọc transcript bài giảng,
// gọi một LLM qua Groq để sinh Review Map (khái niệm + tier + lý do + trích dẫn).
// Không hardcode: toàn bộ concepts/tier/reasons trong output là do model sinh ra tại lúc chạy.
//
// Logic gọi AI (extract → gán tier → gộp bằng code → dựng schema) nằm ở
// codebase/lib/reviewMapGenerator.mjs — dùng chung với codebase/webapp/server (endpoint
// POST /api/generate, chạy live cho demo "case lạ" tại CP6). File này chỉ là CLI wrapper:
// đọc transcript từ đĩa, gọi module chung, ghi kết quả ra eval/run-N/ để dùng cho golden set.
//
// Cách chạy:
//   set GROQ_API_KEY=gsk_...          (PowerShell: $env:GROQ_API_KEY = "gsk_...")
//   node codebase/generate-review-map.mjs
//
// Biến môi trường tuỳ chọn:
//   GROQ_MODEL         mặc định "llama-3.3-70b-versatile"
//   CHUNK_SIZE         số đoạn tối đa mỗi lô ở vòng 1 (gộp nhiều heading liền kề tới khi chạm mốc này), mặc định 18
//   MAX_CORE           gợi ý mềm: số khái niệm tier "core" mong muốn, mặc định 5 (AI có thể vượt nếu thấy cần)
//   TRANSCRIPT_PATH    mặc định data/vlearn-pack/transcript/transcript-04-clean.md
//   OUT_DIR            mặc định eval/run-3
//   REUSE_CANDIDATES   đường dẫn tới một candidates.json cũ — bỏ qua vòng 1, dùng lại candidate đã có
//                       (hữu ích khi chỉ cần sửa vòng gán tier/gộp, không cần tốn thêm lời gọi AI cho vòng 1)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateReviewMap } from "./lib/reviewMapGenerator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  console.error("Thiếu GROQ_API_KEY trong biến môi trường. Set key rồi chạy lại.");
  process.exit(1);
}

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 18);
const MAX_CORE = Number(process.env.MAX_CORE || 5);
const TRANSCRIPT_PATH = process.env.TRANSCRIPT_PATH || join(ROOT, "data/vlearn-pack/transcript/transcript-04-clean.md");
const OUT_DIR = process.env.OUT_DIR || join(ROOT, "eval/run-3");
const REUSE_CANDIDATES_PATH = process.env.REUSE_CANDIDATES;

async function main() {
  const transcriptText = readFileSync(TRANSCRIPT_PATH, "utf-8");
  const reuseCandidates = REUSE_CANDIDATES_PATH ? JSON.parse(readFileSync(REUSE_CANDIDATES_PATH, "utf-8")) : null;

  const { concepts, candidates, taggedCandidates, citationCheck, trace } = await generateReviewMap({
    transcriptText,
    apiKey: API_KEY,
    model: MODEL,
    chunkSize: CHUNK_SIZE,
    maxCore: MAX_CORE,
    reuseCandidates,
    onProgress: (msg) => console.log(msg),
  });

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "candidates.json"), JSON.stringify(candidates, null, 2), "utf-8");
  writeFileSync(join(OUT_DIR, "tagged-candidates.json"), JSON.stringify(taggedCandidates, null, 2), "utf-8");
  writeFileSync(join(OUT_DIR, "ai-output.json"), JSON.stringify({ concepts }, null, 2), "utf-8");
  writeFileSync(join(OUT_DIR, "citation-check.json"), JSON.stringify(citationCheck, null, 2), "utf-8");
  writeFileSync(
    join(OUT_DIR, "trace.json"),
    JSON.stringify(
      {
        ...trace,
        transcriptPath: TRANSCRIPT_PATH,
        reusedCandidatesFrom: REUSE_CANDIDATES_PATH || null,
        candidateCount: candidates.length,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\nOutput: ${OUT_DIR}/{candidates,tagged-candidates,ai-output,citation-check,trace}.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
