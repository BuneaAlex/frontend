import React, { useState, useEffect } from "react";
import { Card, Button, Table, Modal, Alert, Row, Col, Form } from "react-bootstrap";
import ReportDetailsModal from "./ReportDetailsModal";
import {
  getAllReports,
  getReportsByDate,
  getReportsByGameMode,
  getReportsByDateAndMode
} from "./api/reportService";

export default function ReportsPanel() {
  const [mode, setMode] = useState("");
  const [date, setDate] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState("");

  const loadAllReports = async () => {
    try {
      const res = await getAllReports();
      console.log(res.data);
      setReports(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load reports");
    }
  };


  const handleFilter = async () => {
    setError("");
    try {
      if (date && mode) {
        const res = await getReportsByDateAndMode(date, mode.toUpperCase());
        setReports(res.data);
      } else if (date) {
        const res = await getReportsByDate(date);
        setReports(res.data);
      } else if (mode) {
        const res = await getReportsByGameMode(mode.toUpperCase());
        setReports(res.data);
      } else {
        setError("Please select at least one filter.");
      }
    } catch (err) {
      setError("No reports found for the selected filter(s).");
    }
  };

  const clearDate = () => setDate("");
  const clearMode = () => setMode("");

  return (
    <Card style={{ minWidth: 900, maxWidth: '100%' }} className="mx-auto">
      <Card.Body>
        <h4 className="mb-4">Reports</h4>
        <Row className="mb-3 align-items-end">
          <Col md={5}>
            <Form.Label>Date</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="Filter by date"
              />
              {date && (
                <Button variant="outline-secondary" onClick={clearDate} title="Clear date">×</Button>
              )}
            </div>
          </Col>
          <Col md={5}>
            <Form.Label>Game Mode</Form.Label>
            <div className="d-flex gap-2">
              <Form.Select
                value={mode}
                onChange={e => setMode(e.target.value)}
              >
                <option value="">Select Game Mode</option>
                <option value="casual">Casual Mode</option>
                <option value="tournament">Tournament</option>
                <option value="ranked">Ranked</option>
              </Form.Select>
              {mode && (
                <Button variant="outline-secondary" onClick={clearMode} title="Clear mode">×</Button>
              )}
            </div>
          </Col>
          <Col md={2} className="d-flex flex-column gap-2">
            <Button variant="primary" className="w-100" onClick={handleFilter}>Filter</Button>
            <Button variant="secondary" className="w-100" onClick={loadAllReports}>Get All</Button>
          </Col>
        </Row>
        {error && <Alert variant="danger">{error}</Alert>}
        <div style={{overflowX: 'auto'}}>
        <Table striped bordered hover responsive className="mb-0" style={{ minWidth: 850 }}>
          <thead>
            <tr>
              <th>Game Mode</th>
              <th>Algorithm</th>
              <th>Total Matching Requests</th>
              <th>Weights (S/W/L)</th>
              <th>Match Quality</th>
              <th>Skill Quality</th>
              <th>Latency Quality</th>
              <th>Wait Time Quality</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.gameModeType}</td>
                <td>{report.matchmakingAlgorithmName}</td>
                <td>{report.totalQueueRequests}</td>
                <td>{report.skillWeight}/{report.waitTimeWeight}/{report.latencyWeight}</td>
                <td>{report.averageMatchQuality.toFixed(2)}</td>
                <td>{report.skillStatistics.averageSkillQuality.toFixed(2)}</td>
                <td>{report.latencyStatistics.averageLatencyQuality.toFixed(2)}</td>
                <td>{report.waitTimeStatistics.averageWaitTimeQuality.toFixed(2)}</td>
                <td>
                  <Button size="sm" variant="dark" onClick={() => setSelectedReport(report)}>
                    More Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
        <ReportDetailsModal show={!!selectedReport} onHide={() => setSelectedReport(null)} report={selectedReport} />
      </Card.Body>
    </Card>
  );
}
