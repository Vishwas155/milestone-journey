import { useState } from "react";

export default function AddStepModal({ open, stageName, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("NOT_STARTED");

  if (!open) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalTitle">Add Step</div>

        <div className="modalBody">
          <div className="muted">Stage: <b>{stageName || "-"}</b></div>

          <label className="label">Step Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Connect Azure"
          />

          <label className="label">Initial Status</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="NOT_STARTED">NOT_STARTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div className="modalActions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn"
            onClick={() => {
              onSubmit(name, status);
              setName("");
              setStatus("NOT_STARTED");
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}