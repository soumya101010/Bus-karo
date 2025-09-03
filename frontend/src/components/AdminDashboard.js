import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Chart } from 'chart.js';

const socket = io('http://localhost:3000');

export default function AdminDashboard() {
  const [buses, setBuses] = useState([]);
  const chartRef = useRef(null);
  const myChartRef = useRef(null);

  useEffect(() => {
    socket.on('busUpdate', data => {
      setBuses(data);
      updateChart(data);
    });
  }, []);

  const updateChart = (data) => {
    const ctx = chartRef.current.getContext('2d');
    if (myChartRef.current) myChartRef.current.destroy();

    myChartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(b => b.name),
        datasets: [{
          label: 'Distance Covered (meters)',
          data: data.map(b => b.distance),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, overflowY: 'auto', marginRight: '10px' }}>
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
              {buses.map(bus => (
                <tr key={bus.id}>
                  <td>{bus.name}</td>
                  <td>{bus.lat.toFixed(6)}</td>
                  <td>{bus.lon.toFixed(6)}</td>
                  <td>{bus.speed}</td>
                  <td>{bus.distance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1, height: '100%' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}


// // frontend/src/components/AdminDashboard.js
// import React, { useEffect, useState, useRef } from 'react';
// import { socket } from '../socket';
// import axios from 'axios';
// import Chart from 'chart.js/auto';

// const AdminDashboard = () => {
//     const [vehicles, setVehicles] = useState([]);
//     const chartRef = useRef(null); // store chart instance

//     useEffect(() => {
//         // fetch initial vehicles
//         axios.get('http://localhost:5000/api/vehicles')
//             .then(res => setVehicles(res.data))
//             .catch(err => console.error(err));

//         // listen for socket updates
//         socket.on('vehicleLocation', (data) => {
//             setVehicles(prev =>
//                 prev.map(v => v.vehicleId === data.vehicleId ? data : v)
//             );
//         });

//         // cleanup socket on unmount
//         return () => socket.off('vehicleLocation');
//     }, []);

//     useEffect(() => {
//         const ctx = document.getElementById('routeChart')?.getContext('2d');
//         if (!ctx) return;

//         // destroy old chart if exists
//         if (chartRef.current) {
//             chartRef.current.destroy();
//         }

//         // create new chart
//         chartRef.current = new Chart(ctx, {
//             type: 'bar',
//             data: {
//                 labels: vehicles.map(v => v.vehicleId),
//                 datasets: [{
//                     label: 'Vehicles',
//                     data: vehicles.map(() => Math.floor(Math.random() * 10)),
//                     backgroundColor: 'rgba(13, 110, 253, 0.6)'
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false
//             }
//         });

//     }, [vehicles]); // rebuild chart when vehicles change

//     return (
//         <div>
//             <h2>Admin Dashboard</h2>
//             <div style={{ height: '300px' }}>
//                 <canvas id="routeChart"></canvas>
//             </div>
//         </div>
//     );
// };

// export default AdminDashboard;
