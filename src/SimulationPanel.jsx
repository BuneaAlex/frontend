import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import ReportDetailsModal from "./ReportDetailsModal";
import "bootstrap/dist/css/bootstrap.min.css";
import { createReport, getGameModesDetails } from "./api/reportService";


const WEIGHT_COLORS = {
  skill:   { bar: "#639922", bg: "#EAF3DE", text: "#3B6D11", dot: "#639922" },
  wait:    { bar: "#378ADD", bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD" },
  latency: { bar: "#D85A30", bg: "#FAECE7", text: "#712B13", dot: "#D85A30" },
};

function WeightRow({ label, type, value, onChange, min = 0, max = 100 }) {
  const c = WEIGHT_COLORS[type];
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c.dot }} />
          <span style={{ fontSize: 12, color: "var(--bs-body-color)" }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, background: c.bg, color: c.text, padding: "1px 8px", borderRadius: 99 }}>
          {value}%
        </span>
      </div>
      <div style={{ height: 6, background: "#f0f0f0", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${((value - min) / (max - min)) * 100}%`, background: c.bar, borderRadius: 99, transition: "width 0.15s" }} />
      </div>
    </div>
  );
}

export default function SimulationPanel({ onSimulationRun }) {
  const [gameModes, setGameModes] = useState([]);
  const [mode, setMode] = useState("");
  const [date, setDate] = useState("");
  const [skill, setSkill] = useState(0);
  const [wait, setWait] = useState(0);
  const [latency, setLatency] = useState(0);
  const [error, setError] = useState("");
  const [createdReport, setCreatedReport] = useState(null);

  useEffect(() => {
    async function fetchGameModes() {
      try {
        const res = await getGameModesDetails();
        setGameModes(res.data);
        if (res.data.length > 0) {
          const first = res.data[0];
          setMode(first.type.toLowerCase());
          setSkill(first.matchmakingAlgorithm.defaultSkillWeight);
          setWait(first.matchmakingAlgorithm.defaultWaitTimeWeight);
          setLatency(first.matchmakingAlgorithm.defaultLatencyWeight);
        }
      } catch {
        setError("Failed to load game modes.");
      }
    }
    fetchGameModes();
  }, []);

  const handleModeChange = (value) => {
    setMode(value);
    const modeObj = gameModes.find(gm => gm.type.toLowerCase() === value);
    if (modeObj) {
      setSkill(modeObj.matchmakingAlgorithm.defaultSkillWeight);
      setWait(modeObj.matchmakingAlgorithm.defaultWaitTimeWeight);
      setLatency(modeObj.matchmakingAlgorithm.defaultLatencyWeight);
    }
  };

  const clamp = (type, value) => {
    const modeObj = gameModes.find(gm => gm.type.toLowerCase() === mode);
    if (!modeObj) return value;
    const alg = modeObj.matchmakingAlgorithm;
    const ranges = {
      skill:   [alg.minSkillWeight,     alg.maxSkillWeight],
      wait:    [alg.minWaitTimeWeight,  alg.maxWaitTimeWeight],
      latency: [alg.minLatencyWeight,   alg.maxLatencyWeight],
    };
    const [min, max] = ranges[type];
    return Math.min(max, Math.max(min, value));
  };

  const runSimulation = async () => {
    if (!date) { setError("Please select a date."); return; }
    try {
      const res = await createReport({
        gameModeType: mode.toUpperCase(),
        date,
        skillWeight: skill / 100,
        waitTimeWeight: wait / 100,
        latencyWeight: latency / 100,
      });
      setError("");
      setCreatedReport(res.data);
      if (onSimulationRun) onSimulationRun();
    } catch (err) {
      setError(`Simulation failed. ${err?.response?.data ?? ""}`);
    }
  };

  const modeObj = gameModes.find(gm => gm.type.toLowerCase() === mode);
  const alg = modeObj?.matchmakingAlgorithm;

  const inputStyle = {
    width: "100%", fontSize: 13, padding: "6px 8px",
    borderRadius: 8, border: "1px solid #dee2e6",
    background: "var(--bs-body-bg)", color: "var(--bs-body-color)",
  };

  return (
    <>
      <div style={{
        background: "var(--bs-body-bg)",
        border: "1px solid #dee2e6",
        borderRadius: 12,
        padding: "1.25rem",
        marginBottom: "1.5rem",
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: "1rem" }}>New simulation</div>

        {error && <Alert variant="danger" style={{ fontSize: 13, padding: "8px 12px" }}>{error}</Alert>}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 6 }}>Game mode</div>
            <select value={mode} onChange={e => handleModeChange(e.target.value)} style={inputStyle}>
              {gameModes.map(gm => (
                <option key={gm.type} value={gm.type.toLowerCase()}>
                  {gm.type === "CASUAL" ? "Casual" : gm.type.charAt(0) + gm.type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 6 }}>Date</div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ border: "1px solid #dee2e6", borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#6c757d", marginBottom: 12 }}>Matchmaking weights</div>

          <WeightRow
            label="Skill" type="skill" value={skill}
            min={alg?.minSkillWeight} max={alg?.maxSkillWeight}
          />
          <WeightRow
            label="Wait time" type="wait" value={wait}
            min={alg?.minWaitTimeWeight} max={alg?.maxWaitTimeWeight}
          />
          <WeightRow
            label="Latency" type="latency" value={latency}
            min={alg?.minLatencyWeight} max={alg?.maxLatencyWeight}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, marginTop: 4 }}>
            {[
              { label: "Skill %",     type: "skill",   value: skill,   set: setSkill },
              { label: "Wait time %", type: "wait",    value: wait,    set: setWait },
              { label: "Latency %",   type: "latency", value: latency, set: setLatency },
            ].map(({ label, type, value, set }) => (
              <div key={type}>
                <div style={{ fontSize: 11, color: "#6c757d", marginBottom: 4 }}>{label}</div>
                <input
                  type="number" value={value}
                  onChange={e => set(clamp(type, Number(e.target.value)))}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={runSimulation}
          style={{
            width: "100%", padding: "9px", fontSize: 13, fontWeight: 500,
            borderRadius: 8, border: "none", cursor: "pointer",
            background: "#212529", color: "#fff",
          }}
        >
          Run simulation
        </button>
      </div>

      <ReportDetailsModal
        show={!!createdReport}
        onHide={() => setCreatedReport(null)}
        report={createdReport}
      />
    </>
  );
}
