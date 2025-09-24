"use client"

// MapView.js - Enhanced version with bus selection handling
import React, { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet"
import L from "leaflet"
import socket from "../socket" // Using centralized socket configuration
import "leaflet/dist/leaflet.css"

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

// Custom bus icon
const createBusIcon = (color = "blue") => {
  return new L.Icon({
    iconUrl: "/shuttle-bus.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// Custom stop icon
const createStopIcon = () => {
  return new L.Icon({
    iconUrl: "/bus-stop.png",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

export default function MapView() {
  const [buses, setBuses] = useState({})
  const [stops, setStops] = useState([])
  const [connectionStatus, setConnectionStatus] = useState("connecting")
  const [selectedBus, setSelectedBus] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    const handleBusUpdate = (data) => {
      setBuses(data)
      setConnectionStatus("connected")

      // Process stops from server data
      const allStops = []
      Object.values(data).forEach((bus) => {
        if (bus && bus.stops && Array.isArray(bus.stops) && bus.route && Array.isArray(bus.route)) {
          bus.stops.forEach((stopIndex) => {
            if (bus.route[stopIndex]) {
              allStops.push({
                position: bus.route[stopIndex],
                busName: bus.name || `Bus ${bus.id}`,
                busId: bus.id,
                stopIndex: stopIndex,
              })
            }
          })
        }
      })

      setStops(allStops)
    }

    const handleBusSelected = (busDetails) => {
      console.log("Bus selected from admin panel:", busDetails)
      setSelectedBus(busDetails)

      // Center map on selected bus
      if (mapRef.current && busDetails.currentPosition) {
        mapRef.current.setView(busDetails.currentPosition, 15)
      }
    }

    socket.on("connect", () => {
      console.log("✅ Connected to server")
      setConnectionStatus("connected")
      socket.emit("getBuses")
    })

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server")
      setConnectionStatus("disconnected")
    })

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
      setConnectionStatus("error")
    })

    socket.on("busUpdate", handleBusUpdate)
    socket.on("busSelected", handleBusSelected)

    return () => {
      socket.off("busUpdate", handleBusUpdate)
      socket.off("busSelected", handleBusSelected)
    }
  }, [])

  const defaultCenter = [22.5726, 88.3639]

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#2c3e50" }}>
        🚌 Bus-Karo Live Tracking
        {selectedBus && (
          <span style={{ fontSize: "1rem", color: "#666", marginLeft: "15px" }}>Selected: {selectedBus.name}</span>
        )}
      </h2>

      {/* Connection Status */}
      <div
        style={{
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "12px",
          textAlign: "center",
          backgroundColor: connectionStatus === "connected" ? "#d1fae5" : "#fee2e2",
          color: connectionStatus === "connected" ? "#065f46" : "#b91c1c",
          border: "1px solid",
          borderColor: connectionStatus === "connected" ? "#a7f3d0" : "#fecaca",
        }}
      >
        <strong>Status:</strong> {connectionStatus.toUpperCase()} |<strong> Buses:</strong> {Object.keys(buses).length}{" "}
        |<strong> Stops:</strong> {stops.length}
        {selectedBus && ` | Selected: ${selectedBus.name}`}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Bus Stops */}
        {stops.map((stop, index) => (
          <Marker
            key={`stop-${index}-${stop.busId}-${stop.stopIndex}`}
            position={stop.position}
            icon={createStopIcon()}
          >
            <Popup>
              <div style={{ minWidth: "150px", textAlign: "center" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#dc2626" }}>🚏 Bus Stop</h4>
                <p>
                  <strong>{stop.busName}</strong>
                </p>
                <p>Stop #{stop.stopIndex + 1}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Buses */}
        {Object.keys(buses).length > 0 ? (
          Object.keys(buses).map((busId) => {
            const bus = buses[busId]

            // Skip buses without route data
            if (!bus.route || !Array.isArray(bus.route) || bus.route.length === 0) {
              return null
            }

            const isSelected = selectedBus && selectedBus.id === bus.id

            return (
              <React.Fragment key={busId}>
                <Marker
                  position={[bus.lat, bus.lon]}
                  icon={createBusIcon(bus.color)}
                  eventHandlers={{
                    click: () => {
                      setSelectedBus({
                        id: bus.id,
                        name: bus.name,
                        currentPosition: [bus.lat, bus.lon],
                        speed: bus.speed,
                        status: bus.status,
                        passengers: bus.passengers,
                        capacity: bus.capacity,
                      })
                    },
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: "220px" }}>
                      <h3
                        style={{
                          margin: "0 0 10px 0",
                          color: "#2c3e50",
                          borderBottom: "2px solid #eee",
                          paddingBottom: "5px",
                          backgroundColor: isSelected ? "#fff3cd" : "transparent",
                          padding: isSelected ? "10px" : "0",
                          borderRadius: isSelected ? "5px" : "0",
                        }}
                      >
                        🚌 {bus.name}
                        {isSelected && (
                          <span style={{ color: "#856404", fontSize: "12px", marginLeft: "10px" }}>SELECTED</span>
                        )}
                      </h3>

                      <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}
                      >
                        <div>
                          <strong>Speed:</strong>
                        </div>
                        <div>{bus.speed || 0} km/h</div>

                        <div>
                          <strong>Status:</strong>
                        </div>
                        <div>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              backgroundColor:
                                bus.status === "moving"
                                  ? "#d4edda"
                                  : bus.status === "stopped"
                                    ? "#f8d7da"
                                    : bus.status === "decelerating"
                                      ? "#fff3cd"
                                      : "#e2e3e5",
                              color:
                                bus.status === "moving"
                                  ? "#155724"
                                  : bus.status === "stopped"
                                    ? "#721c24"
                                    : bus.status === "decelerating"
                                      ? "#856404"
                                      : "#383d41",
                            }}
                          >
                            {bus.status}
                          </span>
                        </div>

                        <div>
                          <strong>Distance:</strong>
                        </div>
                        <div>{bus.distance?.toFixed(2) || "0"} km</div>

                        <div>
                          <strong>Passengers:</strong>
                        </div>
                        <div>
                          {bus.passengers}/{bus.capacity}
                        </div>
                      </div>

                      {/* Next Stop Information */}
                      <div
                        style={{
                          backgroundColor: "#f8f9fa",
                          padding: "10px",
                          borderRadius: "5px",
                          marginBottom: "10px",
                          borderLeft: "4px solid #007bff",
                        }}
                      >
                        <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#495057" }}>Next Stop</h4>
                        <p style={{ margin: "2px 0", fontSize: "13px" }}>
                          <strong>Distance:</strong>{" "}
                          {bus.distanceToNextStop < 1000
                            ? `${bus.distanceToNextStop} m`
                            : `${(bus.distanceToNextStop / 1000).toFixed(2)} km`}
                        </p>
                        <p style={{ margin: "2px 0", fontSize: "13px" }}>
                          <strong>Stop:</strong> {bus.currentStopNumber || 1}/{bus.totalStops || 1}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ fontSize: "12px" }}>Route Progress</span>
                          <span style={{ fontSize: "12px", fontWeight: "bold" }}>{bus.progress || 0}%</span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#e9ecef",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${bus.progress || 0}%`,
                              height: "100%",
                              backgroundColor: "#28a745",
                              transition: "width 0.3s ease",
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Wait Time if Stopped */}
                      {bus.status === "stopped" && bus.waitTime && (
                        <div
                          style={{
                            backgroundColor: "#fff3cd",
                            padding: "8px",
                            borderRadius: "4px",
                            textAlign: "center",
                            border: "1px solid #ffeaa7",
                          }}
                        >
                          <strong>⏰ Waiting:</strong> {bus.waitTime} seconds
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>

                {/* Bus Route */}
                {bus.route && bus.route.length > 1 && (
                  <Polyline
                    positions={bus.route}
                    color={isSelected ? "#ff0000" : bus.color || "blue"}
                    weight={isSelected ? 5 : 3}
                    opacity={isSelected ? 0.8 : 0.6}
                  />
                )}
              </React.Fragment>
            )
          })
        ) : (
          <Popup position={defaultCenter}>
            <div style={{ textAlign: "center", padding: "10px" }}>
              <p>Waiting for bus data... 🚌</p>
              <p style={{ fontSize: "12px", color: "#666" }}>Check if backend server is running on port 3001</p>
            </div>
          </Popup>
        )}
      </MapContainer>

      {/* Legend */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/shuttle-bus.png" alt="Bus" style={{ width: "20px", height: "20px" }} />
          <span>Live Bus</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/bus-stop.png" alt="Bus Stop" style={{ width: "20px", height: "20px" }} />
          <span>Bus Stop</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "3px", backgroundColor: "blue" }}></div>
          <span>Bus Route</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "3px", backgroundColor: "red" }}></div>
          <span>Selected Bus</span>
        </div>
      </div>
    </div>
  )
}
