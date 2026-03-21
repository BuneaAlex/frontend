import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
);

export default function ChartsModal({ show, onClose, reports }) {

  // Create report options with unique identifiers
  const reportOptions = reports.map((report, index) => ({
    id: `${report.skillWeight}/${report.waitTimeWeight}/${report.latencyWeight}/${report.matchmakingAlgorithmName}/${report.totalQueueRequests}/${index}`,
    report,
    label: `${report.skillWeight}% skill, ${report.waitTimeWeight}% wait, ${report.latencyWeight}% latency - ${report.matchmakingAlgorithmName || "Unknown"} - ${report.totalQueueRequests || 0} queue requests/day`
  }));

  const [chartView, setChartView] = useState("quality");
  const [selectedMetrics, setSelectedMetrics] = useState([
    "matchQuality"
  ]);
  const [selectedDistribution, setSelectedDistribution] = useState("skill");
  const [selectedReports, setSelectedReports] = useState(
    reportOptions.length > 0 ? [reportOptions[0].id] : []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectionMessage, setSelectionMessage] = useState("");

  // Pagination logic
  const itemsPerPage = 4;
  const totalPages = Math.ceil(reportOptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageReports = reportOptions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const toggleReport = (reportId) => {
    const isCurrentlySelected = selectedReports.includes(reportId);

    if (isCurrentlySelected) {
      // Allow deselection at any time
      setSelectedReports(selectedReports.filter(id => id !== reportId));
      setSelectionMessage("");
    } else {
      // Check if trying to select more than 4 reports
      if (selectedReports.length >= 4) {
        setSelectionMessage("Maximum of 4 reports can be selected. Please deselect another report first.");
        return;
      }

      // Allow selection
      setSelectedReports([...selectedReports, reportId]);
      setSelectionMessage("");
    }
  };

  const getMetricValue = (report, metric) => {
    switch (metric) {
      case "matchQuality":
        return report.averageMatchQuality || 0;

      case "waitQuality":
        return report.waitTimeStatistics?.averageWaitTimeQuality || 0;

      case "latencyQuality":
        return report.latencyStatistics?.averageLatencyQuality || 0;

      case "skillQuality":
        return report.skillStatistics?.averageSkillQuality || 0;

      default:
        return 0;
    }
  };

  const metricLabels = {
    matchQuality: "Match Quality",
    waitQuality: "Wait Time Quality",
    latencyQuality: "Latency Quality",
    skillQuality: "Skill Quality"
  };

  const getDistributionData = (report, distributionType) => {
    switch (distributionType) {
      case "skill":
        return [
          report.skillStatistics?.skillDiffBetween0And25Percentage || 0,
          report.skillStatistics?.skillDiffBetween26And75Percentage || 0,
          report.skillStatistics?.skillDiffBetween76And150Percentage || 0,
          report.skillStatistics?.skillDiffBetween151And250Percentage || 0,
          report.skillStatistics?.skillDiffMoreThan250Percentage || 0
        ];
      case "waitTime":
        return [
          report.waitTimeStatistics?.waitBetween0And5sPercentage || 0,
          report.waitTimeStatistics?.waitBetween6And30sPercentage || 0,
          report.waitTimeStatistics?.waitBetween31And59sPercentage || 0,
          report.waitTimeStatistics?.waitMoreThan60sPercentage || 0
        ];
      case "latency":
        return [
          report.latencyStatistics?.latencyBetween10And30msPercentage || 0,
          report.latencyStatistics?.latencyBetween31And60msPercentage || 0,
          report.latencyStatistics?.latencyBetween61And100msPercentage || 0,
          report.latencyStatistics?.latencyBetween101And180msPercentage || 0,
          report.latencyStatistics?.latencyMoreThan180msPercentage || 0
        ];
      default:
        return [];
    }
  };

  const getDistributionLabels = (distributionType) => {
    switch (distributionType) {
      case "skill":
        return ["0-25", "26-75", "76-150", "151-250", "250+"];
      case "waitTime":
        return ["0-5s", "6-30s", "31-59s", "60s+"];
      case "latency":
        return ["10-30ms", "31-60ms", "61-100ms", "101-180ms", "180ms+"];
      default:
        return [];
    }
  };

  const sortedReports = [...reports].sort(
    (a, b) => a.skillWeight - b.skillWeight
  );

  const metricColors = [
    "rgba(75, 192, 192, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)"
  ];

  const chartData = {
    labels: sortedReports.map(
      (r) => `${r.skillWeight}/${r.waitTimeWeight}/${r.latencyWeight}`
    ),
    datasets: selectedMetrics.map((metric, index) => {
      const color = metricColors[index % metricColors.length];
      return {
        label: metricLabels[metric],
        data: sortedReports.map((r) => getMetricValue(r, metric)),
        borderColor: color,
        backgroundColor: color.replace("1)", "0.2)"),
        fill: false,
        tension: 0.2,
        pointBackgroundColor: color,
        pointBorderColor: "#fff"
      };
    })
  };

  const formatWeightsLabel = (label) => {
    const [skill, wait, latency] = String(label).split("/");
    if ([skill, wait, latency].some((v) => v === undefined)) {
      return label;
    }
    return `${skill}% skill, ${wait}% wait, ${latency}% latency`;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => {
            if (!items || !items.length) return "";
            return formatWeightsLabel(items[0].label);
          },
          label: (item) => {
            const report = sortedReports[item.dataIndex];
            const algorithmType = report?.matchmakingAlgorithmName || "Unknown";
            const totalQueueRequests = report?.totalQueueRequests || 0;
            return [
              `${item.dataset.label}: ${item.formattedValue}`,
              `Algorithm: ${algorithmType}`,
              `Total Queue Requests: ${totalQueueRequests}`
            ];
          }
        }
      },
      legend: {
        position: "top"
      }
    },
    scales: {
      x: {
        type: "category",
        ticks: {
          callback: (value, index) => {
            const label = chartData.labels?.[index] ?? value;
            // Keep axis compact; full text remains in tooltip title
            return String(label);
          },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const distributionChartData = {
    labels: getDistributionLabels(selectedDistribution),
    datasets: selectedReports.length > 0 ? selectedReports.map((reportId, index) => {
      const reportOption = reportOptions.find(opt => opt.id === reportId);
      const report = reportOption?.report;
      const color = metricColors[index % metricColors.length];
      const distributionData = report ? getDistributionData(report, selectedDistribution) : [];

      return {
        label: reportOption?.label || "Unknown",
        data: distributionData,
        borderColor: color,
        backgroundColor: color.replace("1)", "0.2)"),
        fill: false,
        tension: 0.2,
        pointBackgroundColor: color,
        pointBorderColor: "#fff"
      };
    }) : []
  };

  const distributionChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => {
            if (!items || !items.length) return "";
            return `${selectedDistribution.charAt(0).toUpperCase() + selectedDistribution.slice(1)} Range: ${items[0].label}`;
          },
          label: (item) => {
            const reportOption = reportOptions.find(opt => opt.id === selectedReports[item.datasetIndex]);
            const report = reportOption?.report;
            const algorithmType = report?.matchmakingAlgorithmName || "Unknown";
            return [
              `${item.dataset.label}: ${item.formattedValue}%`,
              `Algorithm: ${algorithmType}`
            ];
          }
        }
      },
      legend: {
        position: "top"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Percentage (%)"
        },
        ticks: {
          stepSize: 10
        }
      },
      x: {
        title: {
          display: true,
          text: `${selectedDistribution.charAt(0).toUpperCase() + selectedDistribution.slice(1)} Distribution`
        }
      }
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>

      <Modal.Header closeButton>
        <Modal.Title>Matchmaking Analysis</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        <div className="mb-3">
          <Button
            variant={chartView === "quality" ? "primary" : "outline-primary"}
            onClick={() => setChartView("quality")}
            className="me-2"
          >
            Quality Metrics
          </Button>
          <Button
            variant={chartView === "distributions" ? "primary" : "outline-primary"}
            onClick={() => setChartView("distributions")}
          >
            Policy Distributions
          </Button>
        </div>

        {chartView === "quality" ? (
          <>
            <h6>Select Metrics</h6>
            <Form className="mb-3">
              {Object.keys(metricLabels).map(metric => (
                <Form.Check
                  key={metric}
                  type="checkbox"
                  label={metricLabels[metric]}
                  checked={selectedMetrics.includes(metric)}
                  onChange={() => toggleMetric(metric)}
                />
              ))}
            </Form>
            <Line data={chartData} options={chartOptions} />
          </>
        ) : (
          <>
            <h6>Select Distribution Type</h6>
            <Form className="mb-3">
              {["skill", "waitTime", "latency"].map(type => (
                <Form.Check
                  key={type}
                  type="radio"
                  label={`${type.charAt(0).toUpperCase() + type.slice(1)} Distribution`}
                  checked={selectedDistribution === type}
                  onChange={() => setSelectedDistribution(type)}
                  name="distributionType"
                />
              ))}
            </Form>

            <h6>Select Reports</h6>
            {selectionMessage && (
              <Alert variant="warning" className="mb-3">
                {selectionMessage}
              </Alert>
            )}
            <div className="mb-3">
              <Form>
                {currentPageReports.map(option => (
                  <Form.Check
                    key={option.id}
                    type="checkbox"
                    label={option.label}
                    checked={selectedReports.includes(option.id)}
                    onChange={() => toggleReport(option.id)}
                    className="mb-2"
                  />
                ))}
              </Form>

              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <span className="text-muted">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
            <Line data={distributionChartData} options={distributionChartOptions} />
          </>
        )}

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>

    </Modal>
  );
}

