from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# -------------------------
# App setup
# -------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Status weights for progress calculation
# -------------------------
STATUS_WEIGHT = {
    "NOT_STARTED": 0.0,
    "IN_PROGRESS": 0.5,
    "COMPLETED": 1.0,
}

# -------------------------
# Helper: calculate completion %
# -------------------------
def calc_pct(steps: list) -> int:
    """
    Calculates completion percentage from step statuses.
    """
    if not steps:
        return 0

    total = sum(STATUS_WEIGHT.get(step.get("status"), 0.0) for step in steps)
    return round((total / len(steps)) * 100)

# -------------------------
# Helper: recompute all completion percentages
# -------------------------
def recompute(journey: dict) -> None:
    """
    Recalculates:
    - each stage completion %
    - entire journey completion %
    """

    # Ensure stages list exists
    journey.setdefault("stages", [])

    # Recompute each stage
    for stage in journey["stages"]:
        stage.setdefault("steps", [])
        stage["completion_pct"] = calc_pct(stage["steps"])

    # Recompute journey using ALL steps
    all_steps = []
    for stage in journey["stages"]:
        all_steps.extend(stage["steps"])

    journey["completion_pct"] = calc_pct(all_steps)

# -------------------------
# Helper: generate new IDs
# -------------------------
def new_id(prefix: str, existing_ids: set) -> str:
    """
    Generates a unique ID like s1, s2, t1, t2...
    """
    i = 1
    while True:
        cid = f"{prefix}{i}"
        if cid not in existing_ids:
            return cid
        i += 1

# -------------------------
# Helper: find journey by stage_id
# -------------------------
def find_journey_by_stage(stage_id: str):
    """
    Finds which journey owns a given stage.
    """
    for journey in journey_store.values():
        for stage in journey.get("stages", []):
            if stage.get("stage_id") == stage_id:
                return journey, stage
    return None, None

# -------------------------
# Helper: find journey by step_id
# -------------------------
def find_journey_by_step(step_id: str):
    """
    Finds which journey & stage owns a given step.
    """
    for journey in journey_store.values():
        for stage in journey.get("stages", []):
            for step in stage.get("steps", []):
                if step.get("step_id") == step_id:
                    return journey, stage, step
    return None, None, None

# -------------------------
# In-memory data store (demo only)
# -------------------------
journey_store = {
    "123": {
        "journey_id": "123",
        "name": "ISO27001 Readiness",
        "completion_pct": 0,
        "stages": [
            {
                "stage_id": "s1",
                "name": "Initial Scoping",
                "completion_pct": 0,
                "steps": [
                    {"step_id": "t1", "name": "Kickoff Call", "status": "COMPLETED"},
                    {"step_id": "t2", "name": "Define Scope", "status": "IN_PROGRESS"},
                ],
            },
            {
                "stage_id": "s2",
                "name": "Onboarding",
                "completion_pct": 0,
                "steps": [
                    {"step_id": "t3", "name": "Connect AWS", "status": "NOT_STARTED"},
                ],
            },
        ],
    }
}

# ======================================================
# API ENDPOINTS
# ======================================================

# -------------------------
# Get journey
# -------------------------
@app.get("/api/journeys/{journey_id}")
def get_journey(journey_id: str):
    journey = journey_store.get(journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    recompute(journey)
    return journey

# -------------------------
# Update step status
# -------------------------
@app.patch("/api/steps/{step_id}")
def update_step(step_id: str, body: dict):
    status = body.get("status")
    if status not in STATUS_WEIGHT:
        raise HTTPException(status_code=400, detail="Invalid status")

    journey, stage, step = find_journey_by_step(step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    step["status"] = status
    recompute(journey)
    return {"ok": True}

# -------------------------
# Add stage
# -------------------------
@app.post("/api/journeys/{journey_id}/stages")
def add_stage(journey_id: str, body: dict):
    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Stage name required")

    journey = journey_store.get(journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    existing_ids = {s["stage_id"] for s in journey["stages"]}
    stage_id = new_id("s", existing_ids)

    journey["stages"].append({
        "stage_id": stage_id,
        "name": name,
        "completion_pct": 0,
        "steps": [],
    })

    recompute(journey)
    return {"ok": True, "stage_id": stage_id}

# -------------------------
# Delete stage
# -------------------------
@app.delete("/api/stages/{stage_id}")
def delete_stage(stage_id: str):
    journey, stage = find_journey_by_stage(stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    journey["stages"] = [s for s in journey["stages"] if s["stage_id"] != stage_id]
    recompute(journey)
    return {"ok": True}

# -------------------------
# Add step
# -------------------------
@app.post("/api/stages/{stage_id}/steps")
def add_step(stage_id: str, body: dict):
    name = (body.get("name") or "").strip()
    status = body.get("status", "NOT_STARTED")

    if not name:
        raise HTTPException(status_code=400, detail="Step name required")
    if status not in STATUS_WEIGHT:
        raise HTTPException(status_code=400, detail="Invalid status")

    journey, stage = find_journey_by_stage(stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    existing_steps = {
        step["step_id"]
        for s in journey["stages"]
        for step in s["steps"]
    }

    step_id = new_id("t", existing_steps)

    stage["steps"].append({
        "step_id": step_id,
        "name": name,
        "status": status,
    })

    recompute(journey)
    return {"ok": True, "step_id": step_id}

# -------------------------
# Delete step
# -------------------------
@app.delete("/api/steps/{step_id}")
def delete_step(step_id: str):
    journey, stage, step = find_journey_by_step(step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    stage["steps"] = [s for s in stage["steps"] if s["step_id"] != step_id]
    recompute(journey)
    return {"ok": True}
# ======================================================
