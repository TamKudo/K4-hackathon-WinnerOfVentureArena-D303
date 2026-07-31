const BASE = import.meta.env.VITE_API_BASE || "/api";

async function get(pathname) {
  const res = await fetch(`${BASE}${pathname}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Lỗi tải dữ liệu (${res.status})`);
  }
  return res.json();
}

async function post(pathname, payload) {
  const res = await fetch(`${BASE}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Lỗi (${res.status})`);
  return body;
}

export const api = {
  listLessons: () => get("/lessons"),
  getLesson: (id) => get(`/lessons/${id}`),
  listTranscripts: () => get("/transcripts"),
  generate: (transcriptId) => post("/generate", { transcriptId }),
};
