const BASE = import.meta.env.VITE_API_BASE || "/api";

async function get(pathname) {
  const res = await fetch(`${BASE}${pathname}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Lỗi tải dữ liệu (${res.status})`);
  }
  return res.json();
}

async function post(pathname, body) {
  const res = await fetch(`${BASE}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Lỗi gửi dữ liệu (${res.status})`);
  }
  return res.json();
}

export const api = {
  listLessons: () => get("/lessons"),
  getLesson: (id) => get(`/lessons/${id}`),
  getReviewMap: () => get("/review-map"),
  askGroq: (payload) => post("/groq/chat", payload),
};
