import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function LiveDemo({ onBack, onGenerated }) {
  const [transcripts, setTranscripts] = useState(null);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listTranscripts().then(setTranscripts).catch((e) => setError(e.message));
  }, []);

  async function run() {
    if (!selected) return;
    setStatus("loading");
    setError(null);
    try {
      const lesson = await api.generate(selected);
      onGenerated(lesson);
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }

  return (
    <div className="screen">
      <button className="link-back" onClick={onBack}>← Home</button>
      <header className="screen-header">
        <h1>Demo trực tiếp</h1>
        <p className="muted">
          Chọn một transcript trong data pack và gọi AI thật ngay lúc này — không dùng dữ liệu
          có sẵn. Dùng cho case "giám khảo chọn 1 bài lạ tại chỗ".
        </p>
      </header>

      {!transcripts && !error && <p className="muted">Đang tải danh sách transcript...</p>}

      {transcripts && (
        <div className="card-grid">
          {transcripts.map((t) => (
            <button
              key={t.id}
              className={"lesson-card" + (selected === t.id ? " selected" : "")}
              onClick={() => setSelected(t.id)}
              disabled={status === "loading"}
            >
              <h2>{t.fileName}</h2>
            </button>
          ))}
        </div>
      )}

      <button className="btn-primary" disabled={!selected || status === "loading"} onClick={run}>
        {status === "loading" ? "Đang gọi AI thật... (có thể mất 1-2 phút)" : "Sinh Review Map"}
      </button>

      {status === "loading" && (
        <p className="muted small" style={{ marginTop: 12 }}>
          Đang chia transcript thành nhiều lô và gọi Groq thật — không phải giả lập. Nếu bị rate
          limit, script tự chờ và thử lại.
        </p>
      )}

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
