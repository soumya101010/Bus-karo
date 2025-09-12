import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// FIX: Connect to correct port
const socket = io('http://localhost:3001');

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

export default function BusMap() {
  const [buses, setBuses] = useState({});

  useEffect(() => {
    // FIX: Handle object data structure
    socket.on('busUpdate', data => setBuses(data));
    return () => socket.off('busUpdate');
  }, []);

  return (
    <MapContainer center={[22.5726, 88.3639]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 attribution='&copy; OpenStreetMap contributors' />
      {/* FIX: Convert object to array for mapping */}
      {Object.values(buses).map(bus => (
        <Marker key={bus.id} position={[bus.lat, bus.lon]}>
          <Popup>
            <b>{bus.name}</b><br />
            Speed: {bus.speed} km/h<br />
            Distance: {bus.distance.toFixed(2)} km
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}