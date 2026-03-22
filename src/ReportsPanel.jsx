import { useState } from "react";
import { Card, Button, Table, Alert, Row, Col, Form, Pagination } from "react-bootstrap";
import ReportDetailsModal from "./ReportDetailsModal";
import ChartsModal from "./ChartsModal";
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
  const [showCharts, setShowCharts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const loadAllReports = async () => {
    try {
      const res = await getAllReports();
      setReports(res.data);
      setError("");
      setCurrentPage(1);
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
        setCurrentPage(1);
      } else if (date) {
        const res = await getReportsByDate(date);
        setReports(res.data);
        setCurrentPage(1);
      } else if (mode) {
        const res = await getReportsByGameMode(mode.toUpperCase());
        setReports(res.data);
        setCurrentPage(1);
      } else {
        setError("Please select at least one filter.");
      }
    } catch (err) {
      setError("No reports found for the selected filter(s).");
    }
  };

  const clearDate = () => setDate("");
  const clearMode = () => setMode("");

  const totalPages = Math.ceil(reports.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentReports = reports.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleReportDelete = (deletedReportId) => {
    setReports(prevReports => {
      const updatedReports = prevReports.filter(report => report.id !== deletedReportId);
      
      // Adjust current page if we're on a page that no longer exists
      const newTotalPages = Math.ceil(updatedReports.length / pageSize);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (updatedReports.length === 0) {
        setCurrentPage(1);
      }
      
      return updatedReports;
    });
  };

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
            <Button variant="dark" className="w-100" onClick={() => setShowCharts(true)}>Show Charts</Button>
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
            {currentReports.map((report) => (
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
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />
              {Array.from({ length: totalPages }, (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}
        <ReportDetailsModal show={!!selectedReport} onHide={() => setSelectedReport(null)} report={selectedReport} onDelete={handleReportDelete} />
        <ChartsModal show={showCharts} onClose={() => setShowCharts(false)} reports={reports} />
      </Card.Body>
    </Card>
  );
}
