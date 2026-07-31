import { useMemo, useState } from "react";
import { api } from "../api.js";

const QUICK_PROMPTS = [
  "Phân tích sâu các khái niệm Core kèm ví dụ minh họa với trích nguồn",
  "Giải thích chi tiết cơ chế hoạt động và lý thuyết đằng sau các ý chính",
  "So sánh sự khác biệt và mối liên hệ giữa các definition chính",
  "Đưa ra các câu hỏi ôn tập tự luận sâu kèm đáp án và lời giải đầy đủ",
];

const MAX_ATTACHMENT_CHARS = 12_000;

function flattenJson(value) {
  if (Array.isArray(value)) {
    return value.map((item) => flattenJson(item)).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${flattenJson(item)}`)
      .join("\n");
  }
  return String(value ?? "");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInline(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderMarkdown(text) {
  const blocks = String(text || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const trimmedLines = lines.map((line) => line.trimEnd());

      if (/^###\s+/.test(trimmedLines[0])) {
        return `<h3>${formatInline(trimmedLines[0].replace(/^###\s+/, ""))}</h3>`;
      }
      if (/^##\s+/.test(trimmedLines[0])) {
        return `<h2>${formatInline(trimmedLines[0].replace(/^##\s+/, ""))}</h2>`;
      }
      if (/^#\s+/.test(trimmedLines[0])) {
        return `<h1>${formatInline(trimmedLines[0].replace(/^#\s+/, ""))}</h1>`;
      }
      if (trimmedLines.every((line) => /^>\s+/.test(line))) {
        const quote = trimmedLines.map((line) => formatInline(line.replace(/^>\s+/, ""))).join("<br />");
        return `<blockquote>${quote}</blockquote>`;
      }
      if (trimmedLines.every((line) => /^\s*(?:[-*]|\d+\.)\s+/.test(line))) {
        const items = trimmedLines.map((line) => {
          const content = line.replace(/^\s*(?:[-*]|\d+\.)\s+/, "");
          return `<li>${formatInline(content)}</li>`;
        });
        const tag = trimmedLines.some((line) => /^\s*\d+\.\s+/.test(line)) ? "ol" : "ul";
        return `<${tag}>${items.join("")}</${tag}>`;
      }
      const content = trimmedLines.map((line) => formatInline(line)).join("<br />");
      return `<p>${content}</p>`;
    })
    .join("");
}

export default function TutorModal({ onClose, lesson }) {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [replyHtml, setReplyHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const lessonTitle = useMemo(() => lesson?.title || "bài học hiện tại", [lesson?.title]);

  async function handleFilesChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const loaded = await Promise.all(
      files.map(async (file) => {
        const text = await file.text();
        let content = text;

        if (file.name.toLowerCase().endsWith(".json")) {
          try {
            const parsed = JSON.parse(text);
            content = flattenJson(parsed);
          } catch {
            content = text;
          }
        }

        content = content.slice(0, MAX_ATTACHMENT_CHARS);
        if (content.length < text.length) {
          content = `${content}\n\n[Đã cắt bớt để giữ payload nhỏ hơn]`;
        }

        return { name: file.name, content };
      })
    );

    setAttachments((prev) => [...prev, ...loaded]);
    event.target.value = "";
  }

  function removeAttachment(name) {
    setAttachments((prev) => prev.filter((item) => item.name !== name));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!prompt.trim() && !attachments.length) return;

    setLoading(true);
    setError("");
    setReply("");
    setReplyHtml("");

    try {
      const reviewMap = await api.getReviewMap();
      const result = await api.askGroq({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt.trim() || "Hãy trích xuất thông tin quan trọng từ tài liệu đã tải lên." }],
        lessonContext: lesson ? `Lesson title: ${lesson.title}. Subtitle: ${lesson.subtitle || ""}` : "",
        reviewMap,
        attachments,
      });
      setReply(result.reply);
      setReplyHtml(renderMarkdown(result.reply));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function applyPrompt(text) {
    setPrompt(text);
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="modal tutor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tutor-header">
          <div>
            <h2>AI Tutor</h2>
            <p className="muted">Đặt câu hỏi về {lessonTitle} và nhận phản hồi nhanh.</p>
          </div>
          <button className="link" onClick={onClose}>
            Đóng
          </button>
        </div>

        <div className="quick-prompts">
          {QUICK_PROMPTS.map((text) => (
            <button key={text} className="chip-toggle" type="button" onClick={() => applyPrompt(text)}>
              {text}
            </button>
          ))}
        </div>

        <label className="upload-box">
          <span>📎 Tải transcript / chat log (.txt, .md, .json)</span>
          <input type="file" multiple accept=".txt,.md,.json,.log,.csv" onChange={handleFilesChange} />
        </label>

        {attachments.length > 0 && (
          <div className="attachment-list">
            {attachments.map((item) => (
              <div key={item.name} className="attachment-chip">
                <span>{item.name}</span>
                <button type="button" className="link" onClick={() => removeAttachment(item.name)}>
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        <form className="tutor-form" onSubmit={handleSubmit}>
          <textarea
            className="tutor-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder="Ví dụ: giải thích ngắn gọn các khái niệm chính của bài này"
          />
          <div className="tutor-actions">
            <button className="btn-primary" type="submit" disabled={loading || (!prompt.trim() && !attachments.length)}>
              {loading ? "Đang hỏi..." : "Gửi câu hỏi"}
            </button>
          </div>
        </form>

        {error && <div className="error-banner">{error}</div>}
        {replyHtml && (
          <div className="tutor-response" dangerouslySetInnerHTML={{ __html: replyHtml }} />
        )}
      </div>
    </div>
  );
}
