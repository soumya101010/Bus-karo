import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

const socket = io('http://localhost:3000', { transports: ['websocket'] });

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/shuttle-bus.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function MapView() {
  const [buses, setBuses] = useState({});

  useEffect(() => {
    socket.on('busUpdate', data => {
      console.log("Received from server:", data);
      setBuses(data);
    });

    return () => socket.off('busUpdate');
  }, []);

  return (
    <MapContainer center={[22.5726, 88.3639]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Bus markers */}
      {Object.keys(buses).map(busId => (
        <Marker
          key={busId}
          position={[buses[busId].lat, buses[busId].lon]}
          icon={busIcon}
        >
          <Popup>
            <b>{buses[busId].name || busId}</b><br />
            Speed: {buses[busId].speed}<br />
            Distance: {buses[busId].distance.toFixed(2)} m
          </Popup>
        </Marker>
      ))}

      {/* Full routes (static from server) */}
      {Object.keys(buses).map(busId =>
  buses[busId]?.route && buses[busId].route.length > 0 ? (
    <Polyline
      key={busId + "-route"}
      positions={buses[busId].route}
      color={buses[busId]?.color || "blue"}
    />
  ) : null
)}

    </MapContainer>
  );
}
