import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

const socket = io('http://localhost:3000', { transports: ['websocket'] });


// Custom bus icon
// const busIcon = new L.Icon({
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61231.png',
//   iconSize: [30, 30],
// });
// const busIcon = new L.Icon({
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/201/201818.png',
//   iconSize: [32, 32], // bigger than default
//   iconAnchor: [16, 32], // center bottom of icon
//   popupAnchor: [0, -32] // popup appears above bus
// });

const busIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/shuttle-bus.png',
  iconSize: [32, 32], 
  iconAnchor: [16, 32], 
  popupAnchor: [0, -32] 
});
export default function MapView() {
  const [buses, setBuses] = useState({});
  const [history, setHistory] = useState({});

  useEffect(() => {
    socket.on('busUpdate', data => {
      console.log("Received from server:", data);

      setBuses(data);

      // Track history
      setHistory(prev => {
        const newHistory = { ...prev };
        Object.keys(data).forEach(busId => {
          if (!newHistory[busId]) newHistory[busId] = [];
          newHistory[busId].push([data[busId].lat, data[busId].lon]);
        });
        return newHistory;
      });
    });

    return () => socket.off('busUpdate');
  }, []);

  return (
    <MapContainer center={[22.5726, 88.3639]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {Object.keys(buses).map(busId => (
        <Marker key={busId} position={[buses[busId].lat, buses[busId].lon]} icon={busIcon}>
          <Popup>
            <b>{busId}</b><br />
            Speed: {buses[busId].speed}<br />
            Distance: {buses[busId].distance.toFixed(2)} m
          </Popup>
        </Marker>
      ))}

      {Object.keys(history).map(busId => (
        <Polyline key={busId} positions={history[busId]} color="blue" />
      ))}
    </MapContainer>
  );
}
