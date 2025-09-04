import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Chart } from 'chart.js/auto';

const socket = io('http://localhost:3000', { transports: ['websocket'] });


export default function AdminDashboard() {
  const [buses, setBuses] = useState({});
  const chartRef = useRef(null);
  const myChartRef = useRef(null);

  useEffect(() => {
    socket.on('busUpdate', data => {
      setBuses(data);
      updateChart(data);
    });
    return () => socket.off('busUpdate');
  }, []);

  const updateChart = (data) => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (myChartRef.current) myChartRef.current.destroy();

    myChartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Distance Covered (meters)',
          data: Object.values(data).map(b => b.distance),
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Bus Name</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Speed</th>
              <th>Distance Covered (m)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(buses).map(busId => (
              <tr key={busId}>
                <td>{busId}</td>
                <td>{buses[busId].lat.toFixed(6)}</td>
                <td>{buses[busId].lon.toFixed(6)}</td>
                <td>{buses[busId].speed}</td>
                <td>{buses[busId].distance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
