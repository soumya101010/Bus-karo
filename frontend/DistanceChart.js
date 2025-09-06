// DistanceChart.js
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import io from "socket.io-client";

const socket = io("http://localhost:3000", { transports: ["websocket"] });

export default function DistanceChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    socket.on("busUpdate", (data) => {
      const timestamp = new Date().toLocaleTimeString();

      const newEntry = {
        time: timestamp,
      };

      Object.keys(data).forEach((busId) => {
        newEntry[data[busId].name] = data[busId].distance;
      });

      setChartData((prev) => {
        const updated = [...prev, newEntry];
        // keep only last 30 points for smooth chart
        return updated.slice(-30);
      });
    });

    return () => socket.off("busUpdate");
  }, []);

  return (
    <div style={{ width: "95%", height: 400, margin: "20px auto" }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />

          {/* Line for each bus */}
          {chartData.length > 0 &&
            Object.keys(chartData[chartData.length - 1])
              .filter((k) => k !== "time")
              .map((busName, i) => (
                <Line
                  key={busName}
                  type="monotone"
                  dataKey={busName}
                  stroke={["#8884d8", "#82ca9d", "#ff7300"][i % 3]} // different colors
                  strokeWidth={2}
                  dot={false}       // no dots → smooth line
                  isAnimationActive={true}
                  animationDuration={800} // smooth rise animation
                />
              ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
// src/components/DistanceChart.js
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import socket from "../socket"; // make sure you created socket.js

export default function DistanceChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    socket.on("busUpdate", (buses) => {
      const timestamp = new Date().toLocaleTimeString();

      const newData = Object.keys(buses).map((busId) => ({
        time: timestamp,
        bus: buses[busId].name || busId,
        distance: parseFloat(buses[busId].distance.toFixed(2)),
      }));

      // merge data for multiple buses
      setData((prev) => {
        const updated = [...prev, ...newData];
        return updated.slice(-30); // keep last 30 points for smooth graph
      });
    });

    return () => socket.off("busUpdate");
  }, []);

  return (
    <div style={{ width: "90%", height: 300, margin: "30px auto" }}>
      <h3 style={{ textAlign: "center" }}>📈 Distance Covered Over Time</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: "km", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Line
            type="monotone"   // smooth curve instead of sharp angles
            dataKey="distance"
            stroke="#4cafef"
            strokeWidth={3}
            dot={false}       // no dots, smooth line
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
