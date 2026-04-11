import React, { useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { deleteReport } from "./api/reportService";

function QualityBadge({ value }) {
  if (value == null) return null;
  let bg, color;
  if (value >= 75) {
    bg = "#C0DD97"; color = "#3B6D11";
  } else if (value >= 50) {
    bg = "#FAC775"; color = "#633806";
  } else {
    bg = "#F7C1C1"; color = "#791F1F";
  }
  return (
    <span style={{
      fontSize: 12, fontWeight: 500,
      padding: "2px 10px", borderRadius: 99,
      background: bg, color,
    }}>
      {value.toFixed(2)}
    </span>
  );
}

function MetaCard({ label, value }) {
  return (
    <div style={{
      background: "var(--bs-secondary-bg, #f8f9fa)",
      borderRadius: 8, padding: "10px 12px",
    }}>
      <div style={{ fontSize: 11, color: "#6c757d", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function StatCard({ title, quality, primary, rows }) {
  return (
    <div style={{
      border: "0.5px solid rgba(0,0,0,0.12)",
      borderRadius: 8, padding: 12, flex: 1, minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        <QualityBadge value={quality} />
      </div>
      <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8 }}>{primary}</div>
      <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 8 }}>
        <div style={{ fontSize: 11, color: "#6c757d", marginBottom: 4 }}>Distribution</div>
        <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
          <tbody>
            {rows.map(([label, val]) => (
              <tr key={label}>
                <td style={{ color: "#6c757d", padding: "2px 0" }}>{label}</td>
                <td style={{ textAlign: "right", fontWeight: 500, padding: "2px 0" }}>
                  {val.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportDetailsModal({ show, onHide, report, onDelete }) {
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!report) return null;

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteReport(report.id);
      if (onDelete) onDelete(report.id);
      onHide();
    } catch {
      setDeleteError("Failed to delete report. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const { waitTimeStatistics: wt, skillStatistics: sk, latencyStatistics: lt } = report;

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16, fontWeight: 500 }}>Simulation result</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ overflowY: "auto", maxHeight: "65vh", padding: "1rem 1.25rem" }}>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}

          {/* Top meta row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginBottom: 12 }}>
            <MetaCard label="Game mode" value={report.gameModeType} />
            <MetaCard label="Algorithm" value={report.matchmakingAlgorithmName} />
            <MetaCard label="Date" value={report.matchesDate} />
            <MetaCard label="Weights S/W/L" value={`${report.skillWeight} / ${report.waitTimeWeight} / ${report.latencyWeight}`} />
          </div>

          {/* Summary counts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, marginBottom: 12 }}>
            <MetaCard label="Queue requests" value={report.totalQueueRequests} />
            <MetaCard label="Total matches" value={report.totalMatches} />
            <MetaCard label="Abandoned rate" value={report.abandonedMatchesRate} />
          </div>

          {/* Overall quality */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#6c757d" }}>Overall match quality</span>
            <QualityBadge value={report.averageMatchQuality} />
          </div>

          {/* Three stat cards */}
          <div style={{ display: "flex", gap: 10 }}>
            <StatCard
              title="Wait time"
              quality={wt.averageWaitTimeQuality}
              primary={<>Avg wait: <strong>{wt.averageWaitSeconds.toFixed(2)} s</strong></>}
              rows={[
                ["0–5 s", wt.waitBetween0And5sPercentage],
                ["6–30 s", wt.waitBetween6And30sPercentage],
                ["31–59 s", wt.waitBetween31And59sPercentage],
                [">60 s", wt.waitMoreThan60sPercentage],
              ]}
            />
            <StatCard
              title="Skill"
              quality={sk.averageSkillQuality}
              primary={<>Avg diff: <strong>{sk.averageSkillDiff.toFixed(2)}</strong></>}
              rows={[
                ["0–25", sk.skillDiffBetween0And25Percentage],
                ["26–75", sk.skillDiffBetween26And75Percentage],
                ["76–150", sk.skillDiffBetween76And150Percentage],
                ["151–250", sk.skillDiffBetween151And250Percentage],
                [">250", sk.skillDiffMoreThan250Percentage],
              ]}
            />
            <StatCard
              title="Latency"
              quality={lt.averageLatencyQuality}
              primary={<>Avg latency: <strong>{lt.averageLatencyMs.toFixed(2)} ms</strong></>}
              rows={[
                ["10–30 ms", lt.latencyBetween10And30msPercentage],
                ["31–60 ms", lt.latencyBetween31And60msPercentage],
                ["61–100 ms", lt.latencyBetween61And100msPercentage],
                ["101–180 ms", lt.latencyBetween101And180msPercentage],
                [">180 ms", lt.latencyMoreThan180msPercentage],
              ]}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-danger" onClick={() => setShowConfirmDelete(true)} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete report"}
          </Button>
          <Button variant="secondary" onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this report?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete report</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}