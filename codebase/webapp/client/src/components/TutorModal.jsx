export default function TutorModal({ onClose }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>AI Tutor</h2>
        <p className="muted">Chưa kết nối — mock cho demo.</p>
        <button className="btn-primary" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}
