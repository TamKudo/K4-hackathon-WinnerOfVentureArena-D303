export default function Home({ lessons, onOpenLesson, onOpenLiveDemo }) {
  return (
    <div className="screen">
      <header className="screen-header">
        <h1>LectureFocus</h1>
        <p className="muted">Chọn bài học để xem bản đồ ưu tiên ôn tập.</p>
      </header>
      <div className="card-grid">
        {lessons.map((l) => (
          <button key={l.id} className="lesson-card" onClick={() => onOpenLesson(l.id)}>
            <h2>{l.title}</h2>
            <p className="muted">{l.subtitle}</p>
            <div className="chip-row">
              <span className="chip chip-core">{l.counts.core} core</span>
              <span className="chip chip-important">{l.counts.important} important</span>
              <span className="chip chip-supporting">{l.counts.supporting} supporting</span>
            </div>
          </button>
        ))}
      </div>

      <button className="link" style={{ marginTop: 24 }} onClick={onOpenLiveDemo}>
        Demo trực tiếp — gọi AI thật với transcript khác →
      </button>
    </div>
  );
}
