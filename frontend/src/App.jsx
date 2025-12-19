import { useEffect, useMemo, useState } from "react";
import "./App.css";
import StatusTag from "./components/StatusTag";
import UpdateStatusModal from "./components/UpdateStatusModal";
import AddStageModal from "./components/AddStageModal";
import AddStepModal from "./components/AddStepModal";

// App root component for the Mini Milestone Journey UI.
// Manages fetching the journey, user interactions (add/delete/update),
// and controls modal visibility for editing/adding items.

const JOURNEY_ID = "123";

export default function App() {
  // Main data: current journey object and which stage is selected
  const [journey, setJourney] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);

  // UI state: loading indicator and error messages from API calls
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state for updating a step (status)
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  // Modal state for adding stages/steps
  const [addStageOpen, setAddStageOpen] = useState(false);
  const [addStepOpen, setAddStepOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);


  // Add a new stage to the current journey.
// Validates input, sends POST to the API, and refreshes the journey on success.
// async function addStage(stageName) {
//   const name = (stageName || "").trim();
//   if (!name) return alert("Stage name required");

//   const res = await fetch(`/api/journeys/${JOURNEY_ID}/stages`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name }),
//   });

//   if (!res.ok) return alert(`Add stage failed (${res.status})`);
//   setAddStageOpen(false);
//   await fetchJourney();
// } 

// Delete a stage (and its steps) after user confirmation,
// then refresh the journey and clear selection if necessary.
async function deleteStage(stageId) {
  if (!confirm("Delete this stage (and all its steps)?")) return;

  setActionLoading(true);
  try {
    const res = await fetch(`/api/stages/${stageId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete stage failed (${res.status})`);

    if (selectedStageId === stageId) setSelectedStageId(null);
    await fetchJourney();
  } catch (e) {
    alert(e.message || "Delete failed");
  } finally {
    setActionLoading(false);
  }
}


// Add a step to the currently selected stage.
// Sends POST with name and initial status, then refreshes.
// async function addStep(stepName, status) {
//   const name = (stepName || "").trim();
//   if (!name) return alert("Step name required");
//   if (!selectedStageId) return;

//   const res = await fetch(`/api/stages/${selectedStageId}/steps`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name, status }),
//   });

//   if (!res.ok) return alert(`Add step failed (${res.status})`);
//   setAddStepOpen(false);
//   await fetchJourney();
// } 

// Delete a single step after confirmation and refresh the journey.
// async function deleteStep(stepId) {
//   if (!confirm("Delete this step?")) return;

//   const res = await fetch(`/api/steps/${stepId}`, { method: "DELETE" });
//   if (!res.ok) return alert(`Delete step failed (${res.status})`);

//   await fetchJourney();
// } 

  
  // Fetch the full journey from the API, set loading/error states,
  // and ensure a default stage is selected if applicable.
  async function fetchJourney() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/journeys/${JOURNEY_ID}`);
      if (!res.ok) throw new Error(`API failed (${res.status})`);
      const data = await res.json();
      setJourney(data);

      // Default select first stage
      const stillExists = data.stages?.some(s => s.stage_id === selectedStageId);
      if (!stillExists && data.stages?.length) setSelectedStageId(data.stages[0].stage_id);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }

  } 

    // Load journey once on component mount
    useEffect(() => {
      fetchJourney();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  // Derived value: currently selected stage object
  const selectedStage = useMemo(() => {
    if (!journey || !selectedStageId) return null;
    return journey.stages.find((s) => s.stage_id === selectedStageId) || null;
  }, [journey, selectedStageId]);

  // Open the modal to update a step's status
  function openUpdateModal(step) {
    setActiveStep(step);
    setModalOpen(true);
  }

  // Submit a status update for the active step via PATCH,
  // then refresh journey and close modal on success.
  async function submitStatusUpdate(newStatus) {
    if (!activeStep) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/steps/${activeStep.step_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error(`Update failed (${res.status})`);

      setModalOpen(false);
      setActiveStep(null);
      await fetchJourney();
    } catch (e) {
      alert(e.message || "Failed to update");
    } finally {
      setActionLoading(false);
    }
  }
  async function addStage(stageName) {
    const name = (stageName || "").trim();
    if (!name) return alert("Stage name required");

    setActionLoading(true);
    try {
      const res = await fetch(`/api/journeys/${JOURNEY_ID}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error(`Add stage failed (${res.status})`);
      setAddStageOpen(false);
      await fetchJourney();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function addStep(stepName, status) {
    const name = (stepName || "").trim();
    if (!name) return alert("Step name required");

    setActionLoading(true);
    try {
      const res = await fetch(`/api/stages/${selectedStageId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });

      if (!res.ok) throw new Error(`Add step failed (${res.status})`);
      setAddStepOpen(false);
      await fetchJourney();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteStep(stepId) {
    if (!confirm("Delete this step?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/steps/${stepId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchJourney();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  }




  return (
    <div className="page">
      {/* TOP BAR - page title & overall journey completion */}
      <header className="topbar">
        <div className="title">
          Mini Milestone Journey UI
          {journey?.name ? <span className="sub"> — {journey.name}</span> : null}
        </div>
        {journey ? <div className="journeyPct">{journey.completion_pct}% complete</div> : null}
      </header>

      <div className="layout">
        {/* LEFT SIDEBAR - stages list and actions */}
        <aside className="sidebar">
          <div className="rowBetween">
            <div className="sidebarHeading">Stages</div>
            <button
              className="iconBtn"
              disabled={actionLoading}
              onClick={() => setAddStageOpen(true)}
              title="Add Stage"
            >
              +
            </button>

          </div>
          {loading ? (
            <div className="hint">Loading stages...</div>
          ) : error ? (
            <div className="errorBox">❌ {error}</div>
          ) : (
            <div className="stageList">
              {journey.stages.map((stage) => {
                const active = stage.stage_id === selectedStageId;
                return (
                  <button
                    key={stage.stage_id}
                    className={`stageItem ${active ? "active" : ""}`}
                    onClick={() => setSelectedStageId(stage.stage_id)}
                  >
                    <div className="miniBarWrap">
                      <div
                        className="miniBarFill"
                        style={{ width: `${stage.completion_pct}%` }}
                      />
                    </div>
                    <div className="stageRow">
                      <div className="stageName">{stage.name}</div>

                      <div className="smallActions">
                        <div className="stagePct">{stage.completion_pct}%</div>
                        <button
                          className="iconBtn"
                          title="Delete Stage"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteStage(stage.stage_id);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* RIGHT CONTENT */}
        <main className="content">
          {loading ? (
            <div className="card">
              <div className="spinner" />
              <div className="hint">Fetching journey...</div>
            </div>
          ) : error ? (
            <div className="card">
              <div className="errorBox">
                <div className="errorTitle">Could not load journey</div>
                <div>Reason: {error}</div>
                <button className="btn" onClick={fetchJourney} style={{ marginTop: 12 }}>
                  Retry
                </button>
              </div>
            </div>
          ) : !selectedStage ? (
            <div className="card">
              <div className="hint">No stage selected.</div>
            </div>
          ) : (
            <div className="card">
              <div className="stageHeader">
                <div className="h1">{selectedStage.name}</div>

                <div className="progressBlock">
                  <div className="barWrap">
                    <div
                      className="barFill"
                      style={{ width: `${selectedStage.completion_pct}%` }}
                    />
                  </div>
                  <div className="muted">{selectedStage.completion_pct}% complete</div>
                </div>
              </div>

              {/* STEPS LIST - shows steps and action buttons */}
              <div className="stepsBlock">
                <div className="rowBetween">
                  <div className="h2">Steps</div>
                  <button
                    className="iconBtn"
                    disabled={actionLoading}
                    onClick={() => setAddStepOpen(true)}
                    title="Add Step"
                  >
                    +
                  </button>

                </div>

                {!selectedStage.steps || selectedStage.steps.length === 0 ? (
                  <div className="hint">No tasks yet</div>
                ) : (
                  <ul className="stepsList">
                    {selectedStage.steps.map((step) => (
                      <li className="stepRow" key={step.step_id}>
                        <div className="stepLeft">
                          <div className="stepName">{step.name}</div>
                          <StatusTag status={step.status} />
                        </div>

                        <div className="smallActions2">
                          <button
                            className="btn"
                            disabled={actionLoading}
                            onClick={() => openUpdateModal(step)}
                          >
                            {actionLoading ? "Working..." : "Update Status"}
                          </button>

                          <button className="iconBtn" title="Delete Step" onClick={() => deleteStep(step.step_id)}>🗑</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {actionLoading && (
        <div className="actionOverlay">
          <div className="spinnerLarge" />
          <div className="muted">Processing...</div>
        </div>
      )}

      <UpdateStatusModal
        open={modalOpen}
        step={activeStep}
        onClose={() => {
          setModalOpen(false);
          setActiveStep(null);
        }}
        onSubmit={submitStatusUpdate}
      />
      <AddStageModal
        open={addStageOpen}
        onClose={() => setAddStageOpen(false)}
        onSubmit={addStage}
      />

      <AddStepModal
        open={addStepOpen}
        stageName={selectedStage?.name}
        onClose={() => setAddStepOpen(false)}
        onSubmit={addStep}
      />

    </div>
  );
}