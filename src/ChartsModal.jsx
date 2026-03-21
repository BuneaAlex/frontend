import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

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

  const [selectedMetrics, setSelectedMetrics] = useState([
    "matchQuality"
  ]);

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
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

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>

      <Modal.Header closeButton>
        <Modal.Title>Matchmaking Analysis</Modal.Title>
      </Modal.Header>

      <Modal.Body>

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

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>

    </Modal>
  );
}

