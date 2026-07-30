import { useEffect, useRef } from "react";
import { renderSegmentHtml } from "../lib/renderSegment.js";

export default function TranscriptDrawer({ segments, evidenceList, activeIndex, onClose, onPrev, onNext }) {
  const activeRef = useRef(null);
  const activeEv = evidenceList[activeIndex];

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIndex]);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>Transcript</h2>
          <button className="link" onClick={onClose}>Đóng ✕</button>
        </div>

        {evidenceList.length > 1 && (
          <div className="drawer-nav">
            <button className="link" onClick={onPrev} disabled={activeIndex <= 0}>
              ← Trước
            </button>
            <span className="muted small">
              {activeIndex + 1}/{evidenceList.length}
            </span>
            <button className="link" onClick={onNext} disabled={activeIndex >= evidenceList.length - 1}>
              Sau →
            </button>
          </div>
        )}

        <div className="drawer-body">
          {segments.map((seg) => {
            const isActive = activeEv && seg.id === activeEv.evidence.segmentId;
            return (
              <p
                key={seg.id}
                ref={isActive ? activeRef : null}
                className={"segment" + (isActive ? " segment-active" : "")}
              >
                <span className="segment-id">[{seg.id}]</span>{" "}
                <span
                  dangerouslySetInnerHTML={{
                    __html: renderSegmentHtml(seg.text, isActive ? activeEv.evidence : null),
                  }}
                />
              </p>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
