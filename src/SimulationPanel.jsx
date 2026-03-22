import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import ReportDetailsModal from "./ReportDetailsModal";
import "bootstrap/dist/css/bootstrap.min.css";
import { createReport, getGameModesDetails } from "./api/reportService";


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
        // Set default mode to first mode (e.g. RANKED)
        if (res.data.length > 0) {
          const first = res.data[0];
          setMode(first.type.toLowerCase());
          setSkill(first.matchmakingAlgorithm.defaultSkillWeight);
          setWait(first.matchmakingAlgorithm.defaultWaitTimeWeight);
          setLatency(first.matchmakingAlgorithm.defaultLatencyWeight);
        }
      } catch (e) {
        setError("Failed to load game modes");
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

  const validateWeight = (type, value) => {
    const modeObj = gameModes.find(gm => gm.type.toLowerCase() === mode);
    if (!modeObj) return value;
    let min, max;
    if (type === "skill") {
      min = modeObj.matchmakingAlgorithm.minSkillWeight;
      max = modeObj.matchmakingAlgorithm.maxSkillWeight;
    } else if (type === "wait") {
      min = modeObj.matchmakingAlgorithm.minWaitTimeWeight;
      max = modeObj.matchmakingAlgorithm.maxWaitTimeWeight;
    } else if (type === "latency") {
      min = modeObj.matchmakingAlgorithm.minLatencyWeight;
      max = modeObj.matchmakingAlgorithm.maxLatencyWeight;
    }
    if (value < min) return min;
    if (value > max) return max;
    return value;
  };

  const runSimulation = async () => {
    if (!date) {
      setError("Please select a date.");
      return;
    }
    try {
      const body = {
        gameModeType: mode.toUpperCase(),
        date: date,
        skillWeight: skill / 100,
        waitTimeWeight: wait / 100,
        latencyWeight: latency / 100
      };
      const res = await createReport(body);
      setError("");
      setCreatedReport(res.data);
      if (onSimulationRun) onSimulationRun();
    } catch (error) {
      const backendResponse = error?.response?.data;
      setError(`Simulation failed. ${backendResponse}`);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Choose Game Mode</Form.Label>
              <Form.Select value={mode} onChange={(e) => handleModeChange(e.target.value)}>
                {gameModes.map(gm => (
                  <option key={gm.type} value={gm.type.toLowerCase()}>
                    {gm.type === "CASUAL" ? "Casual Mode" : gm.type.charAt(0) + gm.type.slice(1).toLowerCase()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Choose Date</Form.Label>
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Skill Weight (%)</Form.Label>
                  <Form.Control type="number" value={skill} onChange={(e) => setSkill(validateWeight("skill", Number(e.target.value)))} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Wait Time Weight (%)</Form.Label>
                  <Form.Control type="number" value={wait} onChange={(e) => setWait(validateWeight("wait", Number(e.target.value)))} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Latency Weight (%)</Form.Label>
                  <Form.Control type="number" value={latency} onChange={(e) => setLatency(validateWeight("latency", Number(e.target.value)))} />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="dark" className="w-100" onClick={runSimulation}>
              Run Simulation
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <ReportDetailsModal show={!!createdReport} onHide={() => setCreatedReport(null)} report={createdReport} />
    </>
  );
}
