// Nối eval/run-N/ai-output.json (kết quả lời gọi AI thật) vào DATA.lessons["day01-foundation"]
// trong lecturefocus.html — thay concepts dựng tay bằng đúng output model sinh ra.
// segments giữ nguyên. order/estimated_minutes không có trong ai-output.json (không phải
// quyết định của AI, chỉ phục vụ UI) nên được gán ở đây theo tier: core=5' · important=4' · supporting=3'.
//
// Chạy: node codebase/wire-ai-output-to-ui.mjs [đường dẫn ai-output.json, mặc định eval/run-2/ai-output.json]

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "lecturefocus.html");
const aiOutputPath = path.resolve(
  process.argv[2] || path.join(__dirname, "..", "eval", "run-2", "ai-output.json")
);

const html = fs.readFileSync(htmlPath, "utf8");
const startMarker = "const DATA = ";
const start = html.indexOf(startMarker) + startMarker.length;
const rest = html.slice(start);

// Tìm ranh giới object literal bằng đếm ngoặc (không dùng regex vì literal chứa dấu ";" trong chuỗi).
let depth = 0, i = 0, inStr = false, strCh = "", esc = false;
for (; i < rest.length; i++) {
  const ch = rest[i];
  if (inStr) {
    if (esc) esc = false;
    else if (ch === "\\") esc = true;
    else if (ch === strCh) inStr = false;
    continue;
  }
  if (ch === '"' || ch === "'") { inStr = true; strCh = ch; continue; }
  if (ch === "{") depth++;
  if (ch === "}") { depth--; if (depth === 0) { i++; break; } }
}
const data = JSON.parse(rest.slice(0, i));
const ai = JSON.parse(fs.readFileSync(aiOutputPath, "utf8"));

const MIN_BY_TIER = { core: 5, important: 4, supporting: 3 };
const orderCounter = { core: 0, important: 0, supporting: 0 };
const counts = { total: 0, core: 0, important: 0, supporting: 0 };

const newConcepts = ai.concepts.map((c) => {
  orderCounter[c.tier] += 1;
  counts[c.tier] += 1;
  counts.total += 1;
  return {
    id: c.id,
    name: c.name,
    tier: c.tier,
    order: orderCounter[c.tier],
    estimated_minutes: MIN_BY_TIER[c.tier],
    short_summary: c.short_summary,
    uncertain_signal: !!c.uncertain_signal,
    learningPoints: c.learningPoints,
    reasons: c.reasons,
  };
});

const day1 = data.lessons["day01-foundation"];
day1.concepts = newConcepts;
day1.counts = counts;
day1.data_source = `${path.relative(path.join(__dirname, ".."), aiOutputPath).replace(/\\/g, "/")} (lời gọi AI thật qua Groq — xem spec.md §7)`;

const newHtml = html.slice(0, start) + JSON.stringify(data) + html.slice(start + i);
fs.writeFileSync(htmlPath, newHtml);

console.log(`Đã nối ${aiOutputPath} vào lecturefocus.html`);
console.log("Counts mới:", JSON.stringify(counts));
