export default function LessonLanding({ lesson, onBack, onReview }) {
  return (
    <div className="screen">
      <button className="link-back" onClick={onBack}>← Home</button>
      <header className="screen-header">
        <h1>{lesson.title}</h1>
        <p className="muted">{lesson.subtitle}</p>
      </header>
      <p className="disclaimer">{lesson.disclaimer}</p>
      <p className="muted small">Nguồn: {lesson.transcript_source}</p>
      {lesson.data_source && (
        <p className="muted small">Dữ liệu: {lesson.data_source}</p>
      )}
      <button className="btn-primary" onClick={onReview}>Review this lesson</button>
    </div>
  );
}
