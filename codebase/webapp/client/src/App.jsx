import { useEffect, useState } from "react";
import { api } from "./api.js";
import Home from "./components/Home.jsx";
import LessonLanding from "./components/LessonLanding.jsx";
import ReviewMap from "./components/ReviewMap.jsx";
import ConceptDetail from "./components/ConceptDetail.jsx";
import TranscriptDrawer from "./components/TranscriptDrawer.jsx";
import TutorModal from "./components/TutorModal.jsx";
import LiveDemo from "./components/LiveDemo.jsx";

export default function App() {
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState(null);

  const [lesson, setLesson] = useState(null); // chi tiết đầy đủ (segments + concepts)
  const [view, setView] = useState("home"); // home | lesson | map | detail | live
  const [origin, setOrigin] = useState("catalog"); // catalog | live — quyết định nút back từ map đi đâu
  const [conceptId, setConceptId] = useState(null);

  const [drawer, setDrawer] = useState(null); // { evidenceList, activeIndex }
  const [tutorOpen, setTutorOpen] = useState(false);

  useEffect(() => {
    api.listLessons().then(setLessons).catch((e) => setError(e.message));
  }, []);

  async function openLesson(id) {
    setError(null);
    try {
      const full = await api.getLesson(id);
      setLesson(full);
      setConceptId(null);
      setOrigin("catalog");
      setView("lesson");
    } catch (e) {
      setError(e.message);
    }
  }

  function onGenerated(liveLesson) {
    setLesson(liveLesson);
    setConceptId(null);
    setOrigin("live");
    setView("map");
  }

  function openTranscript(evidenceList, activeIndex) {
    setDrawer({ evidenceList, activeIndex });
  }

  const concept = lesson && conceptId ? lesson.concepts.find((c) => c.id === conceptId) : null;

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">LectureFocus</span>
        <button className="link" onClick={() => setTutorOpen(true)}>Hỏi AI Tutor</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {view === "home" && lessons && (
        <Home lessons={lessons} onOpenLesson={openLesson} onOpenLiveDemo={() => setView("live")} />
      )}

      {view === "live" && (
        <LiveDemo onBack={() => setView("home")} onGenerated={onGenerated} />
      )}

      {view === "lesson" && lesson && (
        <LessonLanding
          lesson={lesson}
          onBack={() => setView("home")}
          onReview={() => setView("map")}
        />
      )}

      {view === "map" && lesson && (
        <ReviewMap
          lesson={lesson}
          onBack={() => setView(origin === "live" ? "live" : "lesson")}
          onOpenConcept={(id) => {
            setConceptId(id);
            setView("detail");
          }}
        />
      )}

      {view === "detail" && concept && (
        <ConceptDetail
          concept={concept}
          onBack={() => setView("map")}
          onOpenTranscript={openTranscript}
        />
      )}

      {drawer && (
        <TranscriptDrawer
          segments={lesson.segments}
          evidenceList={drawer.evidenceList}
          activeIndex={drawer.activeIndex}
          onClose={() => setDrawer(null)}
          onPrev={() => setDrawer((d) => ({ ...d, activeIndex: Math.max(0, d.activeIndex - 1) }))}
          onNext={() =>
            setDrawer((d) => ({
              ...d,
              activeIndex: Math.min(d.evidenceList.length - 1, d.activeIndex + 1),
            }))
          }
        />
      )}

      {tutorOpen && <TutorModal onClose={() => setTutorOpen(false)} />}
    </div>
  );
}
