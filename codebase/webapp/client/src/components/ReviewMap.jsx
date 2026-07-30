import { useMemo, useState } from "react";
import { planForBudget } from "../lib/planForBudget.js";

const BUDGETS = [
  { key: "all", label: "Tất cả", limit: null },
  { key: "15", label: "15'", limit: 15 },
  { key: "30", label: "30'", limit: 30 },
  { key: "60", label: "60'", limit: 60 },
];

const TIER_LABEL = { core: "Core", important: "Important", supporting: "Supporting" };

export default function ReviewMap({ lesson, onBack, onOpenConcept }) {
  const [budgetKey, setBudgetKey] = useState("all");
  const limit = BUDGETS.find((b) => b.key === budgetKey).limit;

  const picked = useMemo(
    () => planForBudget(lesson.concepts, limit),
    [lesson.concepts, limit]
  );
  const totalMin = picked.reduce((s, c) => s + c.estimated_minutes, 0);

  const groups = ["core", "important", "supporting"].map((tier) => ({
    tier,
    items: picked.filter((c) => c.tier === tier),
  }));

  return (
    <div className="screen">
      <button className="link-back" onClick={onBack}>← {lesson.title}</button>
      <header className="screen-header">
        <h1>Review Map</h1>
        <p className="muted">
          {picked.length}/{lesson.concepts.length} khái niệm · ~{totalMin}' đọc
        </p>
      </header>

      <div className="budget-row">
        {BUDGETS.map((b) => (
          <button
            key={b.key}
            className={"chip-toggle" + (budgetKey === b.key ? " active" : "")}
            onClick={() => setBudgetKey(b.key)}
          >
            {b.label}
          </button>
        ))}
      </div>

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.tier} className="tier-group">
              <h2 className={"tier-heading tier-" + g.tier}>{TIER_LABEL[g.tier]}</h2>
              <div className="concept-list">
                {g.items.map((c) => (
                  <article key={c.id} className="concept-card">
                    <div className="concept-card-head">
                      <span className={"badge badge-" + c.tier}>{TIER_LABEL[c.tier]}</span>
                      <span className="chip">~{c.estimated_minutes}'</span>
                      {c.uncertain_signal && (
                        <span className="chip chip-warn" title="Tín hiệu trong bài giảng chưa chắc">
                          tín hiệu chưa chắc
                        </span>
                      )}
                    </div>
                    <h3>{c.name}</h3>
                    <p className="muted">{c.short_summary}</p>
                    <button className="link" onClick={() => onOpenConcept(c.id)}>
                      Xem chi tiết →
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )
      )}

      {picked.length < lesson.concepts.length && (
        <p className="muted small">
          Đã ẩn {lesson.concepts.length - picked.length} khái niệm để vừa quỹ {limit}' —
          bấm "Tất cả" để xem hết.
        </p>
      )}
    </div>
  );
}
