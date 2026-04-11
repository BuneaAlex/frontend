import { useState } from "react";
import { Alert } from "react-bootstrap";
import ReportDetailsModal from "./ReportDetailsModal";
import ChartsModal from "./ChartsModal";
import {
  getAllReports, getReportsByDate,
  getReportsByGameMode, getReportsByDateAndMode
} from "./api/reportService";

function QualityBadge({ value }) {
  if (value == null) return null;
  let bg, color;
  if (value >= 75)      { bg = "#C0DD97"; color = "#3B6D11"; }
  else if (value >= 50) { bg = "#FAC775"; color = "#633806"; }
  else                  { bg = "#F7C1C1"; color = "#791F1F"; }
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: bg, color }}>
      {value.toFixed(2)}
    </span>
  );
}

const inputStyle = {
  width: "100%", fontSize: 13, padding: "6px 10px",
  borderRadius: 8, border: "1px solid #dee2e6",
  background: "var(--bs-body-bg)", color: "var(--bs-body-color)",
};

const btnBase = {
  fontSize: 13, padding: "6px 14px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
};

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
      setReports(res.data); setError(""); setCurrentPage(1);
    } catch { setError("Failed to load reports."); }
  };

  const handleFilter = async () => {
    setError("");
    try {
      let res;
      if (date && mode)   res = await getReportsByDateAndMode(date, mode.toUpperCase());
      else if (date)      res = await getReportsByDate(date);
      else if (mode)      res = await getReportsByGameMode(mode.toUpperCase());
      else { setError("Please select at least one filter."); return; }
      setReports(res.data); setCurrentPage(1);
    } catch { setError("No reports found for the selected filter(s)."); }
  };

  const handleReportDelete = (deletedId) => {
    setReports(prev => {
      const updated = prev.filter(r => r.id !== deletedId);
      const newTotal = Math.ceil(updated.length / pageSize);
      if (currentPage > newTotal && newTotal > 0) setCurrentPage(newTotal);
      else if (updated.length === 0) setCurrentPage(1);
      return updated;
    });
  };

  const totalPages = Math.ceil(reports.length / pageSize);
  const currentReports = reports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div style={{
        background: "var(--bs-body-bg)", border: "1px solid #dee2e6",
        borderRadius: 12, padding: "1.25rem",
        minWidth: 900,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Reports</span>
          <button onClick={() => setShowCharts(true)} style={{ ...btnBase, border: "1px solid #dee2e6", background: "transparent", color: "var(--bs-body-color)" }}>
            Show charts
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) auto", gap: 10, alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 5 }}>Date</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              {date && (
                <button onClick={() => setDate("")} style={{ ...btnBase, padding: "6px 10px", border: "1px solid #dee2e6", background: "transparent", color: "#6c757d" }}>×</button>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 5 }}>Game mode</div>
            <div style={{ display: "flex", gap: 6 }}>
              <select value={mode} onChange={e => setMode(e.target.value)} style={inputStyle}>
                <option value="">All modes</option>
                <option value="casual">Casual</option>
                <option value="tournament">Tournament</option>
                <option value="ranked">Ranked</option>
              </select>
              {mode && (
                <button onClick={() => setMode("")} style={{ ...btnBase, padding: "6px 10px", border: "1px solid #dee2e6", background: "transparent", color: "#6c757d" }}>×</button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleFilter} style={{ ...btnBase, border: "none", background: "#212529", color: "#fff" }}>Filter</button>
            <button onClick={loadAllReports} style={{ ...btnBase, border: "1px solid #dee2e6", background: "transparent", color: "var(--bs-body-color)" }}>Get all</button>
          </div>
        </div>

        {error && <Alert variant="danger" style={{ fontSize: 13, padding: "8px 12px" }}>{error}</Alert>}

        <div style={{ border: "1px solid #dee2e6", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                {["Game mode", "Algorithm", "Requests", "Weights S/W/L", "Match quality", "Skill quality", "Latency quality", "Wait quality", ""].map((h, i) => (
                  <th key={i} style={{
                    padding: "9px 12px", fontSize: 11, fontWeight: 500, color: "#6c757d",
                    textAlign: i === 2 ? "right" : i >= 3 && i <= 7 ? "center" : "left",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentReports.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "#6c757d", fontSize: 13 }}>
                    No reports loaded. Use Filter or Get all.
                  </td>
                </tr>
              ) : currentReports.map((report) => (
                <tr key={report.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "9px 12px" }}>{report.gameModeType}</td>
                  <td style={{ padding: "9px 12px", color: "#6c757d" }}>{report.matchmakingAlgorithmName}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right" }}>{report.totalQueueRequests}</td>
                  <td style={{ padding: "9px 12px", textAlign: "center", color: "#6c757d", fontSize: 11 }}>
                    {report.skillWeight} / {report.waitTimeWeight} / {report.latencyWeight}
                  </td>
                  <td style={{ padding: "9px 12px", textAlign: "center" }}><QualityBadge value={report.averageMatchQuality} /></td>
                  <td style={{ padding: "9px 12px", textAlign: "center" }}><QualityBadge value={report.skillStatistics.averageSkillQuality} /></td>
                  <td style={{ padding: "9px 12px", textAlign: "center" }}><QualityBadge value={report.latencyStatistics.averageLatencyQuality} /></td>
                  <td style={{ padding: "9px 12px", textAlign: "center" }}><QualityBadge value={report.waitTimeStatistics.averageWaitTimeQuality} /></td>
                  <td style={{ padding: "9px 12px" }}>
                    <button onClick={() => setSelectedReport(report)} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 6,
                      border: "1px solid #dee2e6", background: "transparent",
                      color: "var(--bs-body-color)", cursor: "pointer", whiteSpace: "nowrap",
                    }}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 12, color: "#6c757d" }}>{reports.length} result{reports.length !== 1 ? "s" : ""}</span>
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 4 }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "1px solid #dee2e6", background: "transparent", color: "#6c757d", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.4 : 1 }}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} style={{
                    fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                    border: i + 1 === currentPage ? "none" : "1px solid #dee2e6",
                    background: i + 1 === currentPage ? "#212529" : "transparent",
                    color: i + 1 === currentPage ? "#fff" : "var(--bs-body-color)",
                  }}>{i + 1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "1px solid #dee2e6", background: "transparent", color: "#6c757d", cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1 }}>›</button>
              </div>
            )}
          </div>
        )}
      </div>

      <ReportDetailsModal show={!!selectedReport} onHide={() => setSelectedReport(null)} report={selectedReport} onDelete={handleReportDelete} />
      <ChartsModal show={showCharts} onClose={() => setShowCharts(false)} reports={reports} />
    </>
  );
}