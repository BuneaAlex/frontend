import React from "react";
import { Modal, Button, Row, Col, Table } from "react-bootstrap";

export default function ReportDetailsModal({ show, onHide, report }) {
  if (!report) return null;
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Simulation Result</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="mb-3">Simulation Details</h5>
        <Row>
          <Col md={6}>
            <p><strong>Game Mode:</strong> {report.gameModeType}</p>
            <p><strong>Algorithm:</strong> {report.matchmakingAlgorithmName}</p>
            <p><strong>Date:</strong> {report.matchesDate}</p>
            <p><strong>Weights:</strong> S:{report.skillWeight} / W:{report.waitTimeWeight} / L:{report.latencyWeight}</p>
            <p><strong>Total Queue Requests:</strong> {report.totalQueueRequests}</p>
            <p><strong>Total Matches:</strong> {report.totalMatches}</p>
            <p><strong>Abandoned Rate:</strong> {report.abandonedMatchesRate}</p>
            <p><strong>Average Match Quality:</strong> {report.averageMatchQuality?.toFixed(2)}</p>
          </Col>
          <Col md={6}>
            <h6>Wait Time</h6>
            <div className="mb-2">
              <strong>Average Wait:</strong> {report.waitTimeStatistics.averageWaitSeconds.toFixed(2)} s<br/>
              <strong>Wait Time Quality:</strong> {report.waitTimeStatistics.averageWaitTimeQuality?.toFixed(2)}
            </div>
            <Table size="sm" bordered className="mb-3">
              <thead>
                <tr className="table-light">
                  <th colSpan={2}>Wait Time Distribution (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>0-5 s</td><td>{report.waitTimeStatistics.waitBetween0And5sPercentage.toFixed(2)}%</td></tr>
                <tr><td>6-30 s</td><td>{report.waitTimeStatistics.waitBetween6And30sPercentage.toFixed(2)}%</td></tr>
                <tr><td>31-59 s</td><td>{report.waitTimeStatistics.waitBetween31And59sPercentage.toFixed(2)}%</td></tr>
                <tr><td>&gt;60 s</td><td>{report.waitTimeStatistics.waitMoreThan60sPercentage.toFixed(2)}%</td></tr>
              </tbody>
            </Table>
            <h6>Skill</h6>
            <div className="mb-2">
              <strong>Average Skill Diff:</strong> {report.skillStatistics.averageSkillDiff.toFixed(2)}<br/>
              <strong>Skill Quality:</strong> {report.skillStatistics.averageSkillQuality.toFixed(2)}
            </div>
            <Table size="sm" bordered className="mb-3">
              <thead>
                <tr className="table-light">
                  <th colSpan={2}>Skill Diff Distribution (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>0-25</td><td>{report.skillStatistics.skillDiffBetween0And25Percentage.toFixed(2)}%</td></tr>
                <tr><td>26-75</td><td>{report.skillStatistics.skillDiffBetween26And75Percentage.toFixed(2)}%</td></tr>
                <tr><td>76-150</td><td>{report.skillStatistics.skillDiffBetween76And150Percentage.toFixed(2)}%</td></tr>
                <tr><td>151-250</td><td>{report.skillStatistics.skillDiffBetween151And250Percentage.toFixed(2)}%</td></tr>
                <tr><td>&gt;250</td><td>{report.skillStatistics.skillDiffMoreThan250Percentage.toFixed(2)}%</td></tr>
              </tbody>
            </Table>
            <h6>Latency</h6>
            <div className="mb-2">
              <strong>Average Latency:</strong> {report.latencyStatistics.averageLatencyMs.toFixed(2)} ms<br/>
              <strong>Latency Quality:</strong> {report.latencyStatistics.averageLatencyQuality.toFixed(2)}
            </div>
            <Table size="sm" bordered>
              <thead>
                <tr className="table-light">
                  <th colSpan={2}>Latency Distribution (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>10-30 ms</td><td>{report.latencyStatistics.latencyBetween10And30msPercentage.toFixed(2)}%</td></tr>
                <tr><td>31-60 ms</td><td>{report.latencyStatistics.latencyBetween31And60msPercentage.toFixed(2)}%</td></tr>
                <tr><td>61-100 ms</td><td>{report.latencyStatistics.latencyBetween61And100msPercentage.toFixed(2)}%</td></tr>
                <tr><td>101-180 ms</td><td>{report.latencyStatistics.latencyBetween101And180msPercentage.toFixed(2)}%</td></tr>
                <tr><td>&gt;180 ms</td><td>{report.latencyStatistics.latencyMoreThan180msPercentage.toFixed(2)}%</td></tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
