import { useState } from "react";

// Modal to add a new stage to the journey.
// Props:
// - open: modal visibility
// - onClose: callback to close the modal
// - onSubmit: callback invoked with the stage name
export default function AddStageModal({ open, onClose, onSubmit }) {
  // Local input state for stage name
  const [name, setName] = useState("");

  if (!open) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalTitle">Add Stage</div>

        <div className="modalBody">
          <label className="label">Stage Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Risk Assessment"
          />
        </div>

        <div className="modalActions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn"
            onClick={() => {
              onSubmit(name);
              setName("");
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}