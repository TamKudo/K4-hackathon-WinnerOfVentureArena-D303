const TIER_LABEL = { core: "Core", important: "Important", supporting: "Supporting" };
const DEPTH_HINT = {
  core: "Ôn sâu hơn — đây là kiến thức nền tảng của buổi học.",
  important: "Ôn vừa đủ — hiểu ý chính, không cần đào sâu.",
  supporting: "Context ngắn — biết sơ để không lạc bối cảnh.",
};

export default function ConceptDetail({ concept, onBack, onOpenTranscript }) {
  const evidenceList = [
    ...concept.learningPoints.map((lp) => ({ ...lp, group: "Những ý cần nắm" })),
    ...concept.reasons.map((r) => ({ ...r, group: "Tại sao nên tập trung?" })),
  ];

  const groups = [
    { key: "Những ý cần nắm", items: concept.learningPoints },
    { key: "Tại sao nên tập trung?", items: concept.reasons },
  ];

  return (
    <div className="screen">
      <button className="link-back" onClick={onBack}>← Review Map</button>
      <header className="screen-header">
        <div className="concept-card-head">
          <span className={"badge badge-" + concept.tier}>{TIER_LABEL[concept.tier]}</span>
          <span className="chip">~{concept.estimated_minutes}'</span>
          <span className="chip">{concept.learningPoints.length} ý cần nắm</span>
        </div>
        <h1>{concept.name}</h1>
        <p className="muted">{DEPTH_HINT[concept.tier]}</p>
      </header>

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.key} className="detail-block">
              <h2>{g.key}</h2>
              <ul className="evidence-list">
                {g.items.map((item, i) => {
                  const globalIndex = evidenceList.findIndex(
                    (e) => e.group === g.key && e.text === item.text
                  );
                  return (
                    <li key={i}>
                      <p>{item.text}</p>
                      <button
                        className="citation-btn"
                        onClick={() => onOpenTranscript(evidenceList, globalIndex)}
                      >
                        [{item.evidence.segmentId}] · Xem trong bài giảng →
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )
      )}

      <section className="detail-block muted small">
        <p>Trong tài liệu: Slide — (sắp có)</p>
        <p>Trong bài giảng: timestamp — (sắp có)</p>
      </section>
    </div>
  );
}
