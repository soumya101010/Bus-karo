import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

const socket = io('http://localhost:3000');

export default function MapView() {
  const [buses, setBuses] = useState([]);

  const routes = [
    [
      [22.5726, 88.3639],
      [22.5730, 88.3645],
      [22.5740, 88.3650],
      [22.5750, 88.3660],
    ],
    [
      [22.5728, 88.3637],
      [22.5735, 88.3642],
      [22.5745, 88.3650],
      [22.5755, 88.3660],
    ],
  ];

  useEffect(() => {
    socket.on('busUpdate', data => setBuses(data));
  }, []);

  return (
    <MapContainer center={[22.5726, 88.3639]} zoom={15} style={{ height: '500px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {routes.map((route, idx) => (
        <Polyline key={idx} positions={route} color="blue" />
      ))}
      {buses.map(bus => (
        <Marker key={bus.id} position={[bus.lat, bus.lon]} />
      ))}
    </MapContainer>
  );
}
