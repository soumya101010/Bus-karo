// src/components/AdminDashboard.js
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Chart } from "chart.js/auto";
import "./AdminDashboard.css";

const socket = io("http://localhost:3000", { transports: ["websocket"] });

export default function AdminDashboard() {
  const [buses, setBuses] = useState({});
  const chartRef = useRef(null);
  const myChartRef = useRef(null);
  const timeLabels = useRef([]); // keep time axis
  const datasetsRef = useRef({}); // store per-bus dataset

  useEffect(() => {
    socket.on("busUpdate", (data) => {
      setBuses(data);
      updateChart(data);
    });
    return () => socket.off("busUpdate");
  }, []);

  const updateChart = (data) => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    // initialize chart once
    if (!myChartRef.current) {
      myChartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 500,
            easing: "easeInOutQuad",
          },
          plugins: {
            legend: { labels: { color: "#333" } },
            title: {
              display: true,
              text: "Bus Distance Travelled", // ✅ cleaned title
              color: "#111",
              font: { size: 18 },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: "#333" },
            },
            x: {
              ticks: { color: "#333" },
            },
          },
        },
      });
    }

    const chart = myChartRef.current;

    // push new timestamp
    const now = new Date().toLocaleTimeString();
    timeLabels.current.push(now);
    if (timeLabels.current.length > 20) timeLabels.current.shift(); // keep last 20 points
    chart.data.labels = [...timeLabels.current];

    // update datasets for each bus
    Object.values(data).forEach((bus) => {
      if (!datasetsRef.current[bus.id]) {
        // create dataset for new bus
        datasetsRef.current[bus.id] = {
          label: bus.name,
          data: [],
          borderColor:
            bus.color ||
            `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        };
        chart.data.datasets.push(datasetsRef.current[bus.id]);
      }

      const dataset = datasetsRef.current[bus.id];
      dataset.data.push(bus.distance.toFixed(2));
      if (dataset.data.length > 20) dataset.data.shift();
    });

    chart.update("active");
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Admin Dashboard</h2>

      {/* Table */}
      <div className="card">
        <h3>Live Bus Data</h3>
        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Bus Name</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Speed</th>
                <th>Distance Covered (km)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(buses).map((busId) => (
                <tr key={busId}>
                  <td>{buses[busId].name}</td>
                  <td>{buses[busId].lat.toFixed(6)}</td>
                  <td>{buses[busId].lon.toFixed(6)}</td>
                  <td>{buses[busId].speed.toFixed(2)} km/h</td>
                  <td>{buses[busId].distance.toFixed(2)} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Line Chart */}
      <div className="card">
        <h3>📈 Distance Covered</h3> {/* ✅ emoji added here */}
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
