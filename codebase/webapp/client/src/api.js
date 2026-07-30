const BASE = import.meta.env.VITE_API_BASE || "/api";

async function get(pathname) {
  const res = await fetch(`${BASE}${pathname}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Lỗi tải dữ liệu (${res.status})`);
  }
  return res.json();
}

export const api = {
  listLessons: () => get("/lessons"),
  getLesson: (id) => get(`/lessons/${id}`),
};
