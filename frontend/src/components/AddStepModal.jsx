// useState is used to manage local form state inside the modal
import { useState } from "react";

/**
 * AddStepModal Component
 * ---------------------
 * A controlled modal used to add a new step under a selected stage.
 *
 * Props:
 * - open (boolean): controls whether the modal is visible
 * - stageName (string): name of the currently selected stage (display only)
 * - onClose (function): called when the modal should be closed
 * - onSubmit (function): called with (name, status) when user adds a step
 */
export default function AddStepModal({ open, stageName, onClose, onSubmit }) {
  /* ============================
     LOCAL FORM STATE
     ============================ */

  // Stores the step name entered by the user
  const [name, setName] = useState("");

  // Stores the selected initial status for the step
  const [status, setStatus] = useState("NOT_STARTED");

  /* ============================
     VISIBILITY CONTROL
     ============================ */

  // If modal is not open, render nothing
  // This prevents unnecessary DOM nodes
  if (!open) return null;

  /* ============================
     UI RENDER
     ============================ */

  return (
    // Full-screen semi-transparent overlay
    // Clicking on it closes the modal
    <div className="modalOverlay" onClick={onClose}>
      
      {/* 
        Modal container
        stopPropagation prevents overlay click
        from closing modal when clicking inside it
      */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal title */}
        <div className="modalTitle">Add Step</div>

        {/* Modal body containing form fields */}
        <div className="modalBody">
          
          {/* Display current stage name (read-only info) */}
          <div className="muted">
            Stage: <b>{stageName || "-"}</b>
          </div>

          {/* Step name input */}
          <label className="label">Step Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Connect Azure"
          />

          {/* Initial status dropdown */}
          <label className="label">Initial Status</label>
          <select
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="NOT_STARTED">NOT_STARTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        {/* Modal footer action buttons */}
        <div className="modalActions">
          
          {/* Cancel button closes the modal without submitting */}
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>

          {/* 
            Add button:
            - Calls parent submit handler
            - Resets local form state after submission
          */}
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
