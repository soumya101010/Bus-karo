const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Example: realistic route coordinates (generated from OSM for Salt Lake route)
const busRoutes = [
  {
    id: 1,
    name: "Bus 1",
    coords: [
      [22.5726, 88.3639], // start
      [22.5730, 88.3645],
      [22.5740, 88.3650],
      [22.5750, 88.3660], // end
    ],
    speed: 0.00005, // move increment
    index: 0,
    distanceCovered: 0,
  },
  {
    id: 2,
    name: "Bus 2",
    coords: [
      [22.5728, 88.3637],
      [22.5735, 88.3642],
      [22.5745, 88.3650],
      [22.5755, 88.3660],
    ],
    speed: 0.00004,
    index: 0,
    distanceCovered: 0,
  },
];

// Helper: calculate distance between two points
function getDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // meters
}

// Move buses smoothly along the route
function moveBuses() {
  busRoutes.forEach(bus => {
    const current = bus.coords[bus.index];
    const next = bus.coords[bus.index + 1];

    if (next) {
      // interpolate towards next point
      const latDiff = next[0] - current[0];
      const lonDiff = next[1] - current[1];

      const distance = getDistance(current, next);

      const stepLat = latDiff * bus.speed / distance;
      const stepLon = lonDiff * bus.speed / distance;

      bus.coords[bus.index][0] += stepLat;
      bus.coords[bus.index][1] += stepLon;
      bus.distanceCovered += getDistance(current, [current[0]+stepLat, current[1]+stepLon]);

      if (getDistance(current, next) < 0.5) {
        bus.index++;
      }
    }
  });

  io.emit('busUpdate', busRoutes.map(bus => ({
    id: bus.id,
    name: bus.name,
    lat: bus.coords[bus.index]?.[0] || bus.coords[bus.coords.length-1][0],
    lon: bus.coords[bus.index]?.[1] || bus.coords[bus.coords.length-1][1],
    speed: bus.speed,
    distance: bus.distanceCovered,
  })));
}

setInterval(moveBuses, 100); // update 10 times per second

server.listen(3000, () => console.log('Server running on port 3000'));
