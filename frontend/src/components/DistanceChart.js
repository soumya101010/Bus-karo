// src/components/DistanceChart.js
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

const socket = io('http://localhost:3000', { transports: ['websocket'] });


export default function DistanceChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    socket.on("busUpdate", (buses) => {
      const timestamp = new Date().toLocaleTimeString();

      // convert buses data into one row per bus
      const newData = {};
      Object.keys(buses).forEach((busId) => {
        newData[buses[busId].name || busId] = parseFloat(
          buses[busId].distance.toFixed(2)
        );
      });
      newData.time = timestamp;

      setData((prev) => {
        const updated = [...prev, newData];
        return updated.slice(-30); // keep last 30 points
      });
    });

    return () => socket.off("busUpdate");
  }, []);

  return (
    <div style={{ width: "90%", height: 350, margin: "30px auto" }}>
      <h3 style={{ textAlign: "center" }}>📈 Distance Covered (per bus)</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: "km", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          {Object.keys(data[0] || {})
            .filter((key) => key !== "time")
            .map((busKey, i) => (
              <Line
                key={busKey}
                type="monotone"
                dataKey={busKey}
                stroke={["#4cafef", "#ff7300", "#82ca9d"][i % 3]} // rotate colors
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
