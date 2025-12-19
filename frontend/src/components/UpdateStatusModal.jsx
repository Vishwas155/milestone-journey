import { useEffect, useState } from "react";

// Options available for step status
const OPTIONS = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

// Modal for updating a step's status.
// Props:
// - open: whether the modal is visible
// - step: the step object being edited (provides current name/status)
// - onClose: close handler
// - onSubmit: submit handler receiving the new status
export default function UpdateStatusModal({ open, step, onClose, onSubmit }) {
  // Local state for the select value
  const [value, setValue] = useState("NOT_STARTED");

  // When a different step prop is provided, initialize the select value
  useEffect(() => {
    if (step?.status) setValue(step.status);
  }, [step]);

  if (!open) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalTitle">Update Status</div>

        <div className="modalBody">
          <div className="muted">
            Step: <b>{step?.name || "-"}</b>
          </div>

          <label className="label">New Status</label>
          <select className="select" value={value} onChange={(e) => setValue(e.target.value)}>
            {OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="modalActions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={() => onSubmit(value)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}