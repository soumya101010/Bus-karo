"use client"

// src/components/AdminDashboard.js - Complete solution with bus selection
import { useEffect, useState, useRef } from "react"
import socket from "../socket"
import { Chart } from "chart.js/auto"
import "./AdminDashboard.css"

// Import images (adjust paths as needed)
const busImage = new Image();
busImage.src = "/shuttle-bus.png";

const stopImage = new Image();
stopImage.src = "/bus-stop.png";


export default function AdminDashboard() {
  const [buses, setBuses] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const chartRef = useRef(null)
  const myChartRef = useRef(null)
  const timeLabels = useRef([])
  const datasetsRef = useRef({})
  const [totalArea, setTotalArea] = useState(0)

  const updateChart = (data) => {
    if (!chartRef.current) {
      console.log("Chart canvas not available yet")
      return
    }

    const ctx = chartRef.current.getContext("2d")

    // Initialize chart if it doesn't exist
    if (!myChartRef.current) {
      console.log("Creating new chart instance")
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
            duration: 300,
          },
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "#64748b",
                font: {
                  size: 12,
                },
                usePointStyle: true,
                padding: 20,
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderWidth: 1,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
              ticks: {
                color: "#64748b",
                callback: (value) => value + " km",
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "#64748b",
                maxRotation: 0,
                font: {
                  size: 10,
                },
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hoverRadius: 4,
            },
          },
          interaction: {
            mode: "index",
            intersect: false,
          },
        },
      })
    }

    const chart = myChartRef.current
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    // Update time labels
    timeLabels.current.push(now)
    if (timeLabels.current.length > 15) timeLabels.current.shift()
    chart.data.labels = [...timeLabels.current]

    // Update datasets for each bus (distance vs time)
    Object.values(data).forEach((bus) => {
      const busName = bus.name || `Bus ${bus.id}`

      if (!datasetsRef.current[bus.id]) {
        console.log("Adding new dataset for bus:", busName)
        const color = getColorForBus(bus.id)

        datasetsRef.current[bus.id] = {
          label: busName,
          data: [],
          borderColor: color,
          backgroundColor: color + "20",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: color,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: "#fff",
          pointHoverRadius: 5,
        }
        chart.data.datasets.push(datasetsRef.current[bus.id])
      }

      const dataset = datasetsRef.current[bus.id]
      const distance = bus.distance || 0
      dataset.data.push(distance)

      // Keep only last 15 data points
      if (dataset.data.length > 15) dataset.data.shift()
    })

    // Remove datasets for buses that are no longer present
    const currentBusIds = Object.values(data).map((bus) => bus.id)
    Object.keys(datasetsRef.current).forEach((busId) => {
      if (!currentBusIds.includes(Number.parseInt(busId))) {
        delete datasetsRef.current[busId]
      }
    })

    chart.data.datasets = chart.data.datasets.filter((dataset) => {
      const busId = Object.keys(datasetsRef.current).find((id) => datasetsRef.current[id] === dataset)
      return busId !== undefined
    })

    chart.update("none")
  }

  const getColorForBus = (busId) => {
    const colors = [
      "#2563eb",
      "#dc2626",
      "#16a34a",
      "#9333ea",
      "#ea580c",
      "#0891b2",
      "#ca8a04",
      "#db2777",
      "#65a30d",
      "#7c3aed",
    ]
    return colors[busId % colors.length]
  }

  const calculateTotalArea = (busData) => {
    let totalCoverage = 0
    const busCount = Object.keys(busData).length

    Object.values(busData).forEach((bus) => {
      const distance = bus.distance || 0
      const baseCoverage = distance * 2.5
      const busMultiplier = 1 + busCount * 0.1
      const nonLinearGrowth = Math.sqrt(distance) * 15
      const busCoverage = (baseCoverage + nonLinearGrowth) * busMultiplier
      totalCoverage += busCoverage
    })

    const urbanBase = 150
    totalCoverage += urbanBase

    setTotalArea(totalCoverage)
    return totalCoverage
  }

  const handleBusClick = (busId) => {
    console.log("Bus clicked:", busId)
    socket.emit("selectBus", busId)
  }

  useEffect(() => {
    console.log("AdminDashboard: Setting up socket connection...")

    socket.on("connect", () => {
      console.log("Connected to server from AdminDashboard")
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
      setIsConnected(false)
    })

    socket.on("busUpdate", (data) => {
      console.log("Received bus update:", Object.keys(data).length, "buses")
      setBuses(data)
      calculateTotalArea(data)
      updateChart(data)
    })

    socket.emit("getBuses")

    return () => {
      console.log("AdminDashboard: Cleaning up socket connection")
      socket.off("connect")
      socket.off("disconnect")
      socket.off("busUpdate")
    }
  }, []) // Removed updateChart from dependency array to fix ESLint warning

  const totalPassengers = Object.values(buses).reduce((sum, bus) => sum + (bus.passengers || 0), 0)
  const activeBuses = Object.values(buses).filter((bus) => bus.status !== "stopped").length

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-container">
        <h2 className="dashboard-header">Dashboard Overview</h2>
        <div className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
          {isConnected ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚌</div>
          <h3>Total Buses</h3>
          <p className="stat-number">{Object.keys(buses).length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <h3>Active Buses</h3>
          <p className="stat-number">{activeBuses}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Total Passengers</h3>
          <p className="stat-number">{totalPassengers}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🗺️</div>
          <h3>Area Coverage</h3>
          <p className="stat-number">{totalArea.toFixed(1)} km²</p>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h3>🚌 Live Bus Data</h3>
        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Bus</th>
                <th>Speed</th>
                <th>Distance</th>
                <th>Status</th>
                <th>Passengers</th>
                <th>Next Stop</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(buses).length === 0 ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    {isConnected ? "Waiting for bus data..." : "Connecting to server..."}
                  </td>
                </tr>
              ) : (
                Object.keys(buses).map((busId) => {
                  const bus = buses[busId]
                  return (
                    <tr key={busId} onClick={() => handleBusClick(busId)} className="clickable-row">
                      <td>
                        <div className="bus-info">
                          <div
                            className="bus-color-indicator"
                            style={{ backgroundColor: bus.color || getColorForBus(bus.id) }}
                          />
                          <span className="color-bullet">{bus.colorBullet || "🚌"}</span>
                          <span className="bus-name">{bus.name || `Bus ${bus.id}`}</span>
                        </div>
                      </td>
                      <td className="speed-cell">{bus.speed || 0} km/h</td>
                      <td className="distance-cell">{(bus.distance || 0).toFixed(1)} km</td>
                      <td>
                        <span className={`status ${bus.status || "unknown"}`}>{bus.status || "unknown"}</span>
                      </td>
                      <td className="passenger-cell">
                        {bus.passengers || 0}
                        <span className="capacity">/{bus.capacity || 50}</span>
                      </td>
                      <td className="next-stop-cell">
                        {bus.distanceToNextStop
                          ? bus.distanceToNextStop < 1000
                            ? `${bus.distanceToNextStop}m`
                            : `${(bus.distanceToNextStop / 1000).toFixed(1)}km`
                          : "N/A"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart - Distance vs Time for all buses */}
      <div className="card">
        <div className="card-header">
          <h3>📈 Live Distance Tracking</h3>
          <span className="chart-info">{timeLabels.current.length} data points</span>
        </div>
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  )
}
