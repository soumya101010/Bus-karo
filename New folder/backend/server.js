const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Example bus routes
const busRoutes = [
  {
    id: 1,
    name: "Bus 1",
    coords: [
      [22.579749, 88.428817],
      [22.580164, 88.428489],
      [22.579688, 88.427669],
      [22.579338, 88.427064],
      [22.578988, 88.426504],
      [22.577961, 88.401492],
      [22.574076, 88.411431],
      [22.572918, 88.4169],
      [22.572586, 88.438103]
    ],
    speed: 0.0001,
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
      [22.5765, 88.3670]
    ],
    speed: 0.00008,
    index: 0,
    distanceCovered: 0,
  },
];

// Haversine distance
function getDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Move buses
function moveBuses() {
  busRoutes.forEach(bus => {
    const current = bus.coords[bus.index];
    const next = bus.coords[bus.index + 1];

    if (next) {
      const latDiff = next[0] - current[0];
      const lonDiff = next[1] - current[1];
      const distance = getDistance(current, next);

      const stepLat = (latDiff / distance) * bus.speed * 1000;
      const stepLon = (lonDiff / distance) * bus.speed * 1000;

      bus.coords[bus.index][0] += stepLat;
      bus.coords[bus.index][1] += stepLon;
      bus.distanceCovered += getDistance(current, [current[0] + stepLat, current[1] + stepLon]);

      if (getDistance(current, next) < 2) {
        bus.index++;
      }
    }
  });
  // server logs
console.log("Emitting buses:", JSON.stringify(busRoutes.map(bus => ({
  id: bus.name,
  lat: bus.coords[bus.index]?.[0],
  lon: bus.coords[bus.index]?.[1]
}))));
//
  // Emit as object keyed by bus name
  io.emit(
    'busUpdate',
    Object.fromEntries(
      busRoutes.map(bus => [
        bus.name,
        {
          lat: bus.coords[bus.index]?.[0] || bus.coords[bus.coords.length - 1][0],
          lon: bus.coords[bus.index]?.[1] || bus.coords[bus.coords.length - 1][1],
          speed: bus.speed,
          distance: bus.distanceCovered
        }
      ])
    )
  );
}

setInterval(moveBuses, 1000);

server.listen(3000, () => console.log('Server running on port 3000'));
