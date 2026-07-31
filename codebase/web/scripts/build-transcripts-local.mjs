// Sinh public/data/transcripts.local.json từ transcript trong data pack.
//
// File output KHÔNG commit (đã có trong .gitignore) — theo đúng quy định bảo mật data pack
// ở README §"Bảo mật dữ liệu": repo nộp bài chỉ chứa trích dẫn ngắn, không chứa nguyên
// transcript. Mỗi người trong nhóm tự chạy script này trên máy mình khi cần bản đầy đủ.
//
// Có transcript local thì UI mới:
//   - mở được panel transcript khi bấm vào một trích dẫn (evidence)
//   - bật được lớp "làm sâu" bằng Gemini (cần thêm GEMINI_API_KEY trong codebase/web/.env)
//
// Chạy:  node scripts/build-transcripts-local.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(webRoot, '../..')

/** lessonId trong UI ↔ file transcript trong data pack */
const LESSONS = [
  { id: 'day01-foundation', file: 'data/vlearn-pack/transcript/transcript-04-clean.md' },
]

/** Parse các đoạn dạng **[T04-001]** nội dung — cùng quy tắc với reviewMapGenerator.mjs */
function parseSegments(mdText) {
  const segments = []
  const re = /\*\*\[(T\d+-\d+)\]\*\*\s*(.+)/g
  let m
  while ((m = re.exec(mdText)) !== null) {
    segments.push({ id: m[1], text: m[2].trim() })
  }
  return segments
}

const out = {}
for (const lesson of LESSONS) {
  const src = path.join(repoRoot, lesson.file)
  if (!existsSync(src)) {
    console.error(`Bỏ qua ${lesson.id}: không tìm thấy ${lesson.file}`)
    continue
  }
  const segments = parseSegments(readFileSync(src, 'utf8'))
  if (!segments.length) {
    console.error(`Bỏ qua ${lesson.id}: không parse được đoạn nào — kiểm tra định dạng [Txx-NNN]`)
    continue
  }
  out[lesson.id] = { segments }
  console.log(`${lesson.id}: ${segments.length} đoạn (${segments[0].id} → ${segments[segments.length - 1].id})`)
}

const outDir = path.join(webRoot, 'public/data')
mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'transcripts.local.json')
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')

console.log(`\nĐã ghi ${path.relative(repoRoot, outPath)}`)
console.log('File này nằm trong .gitignore — không commit, không chia sẻ ra ngoài khoá học.')
