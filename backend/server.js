const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

app.use(express.static('public'));

// --- Bus Routes ---
const busRoutes = [];
console.log('🚌 Loading bus routes manually...');
try {
  const barasat_korunamoyi = require('./routes/routeData/barasat_korunamoyi.js');
  busRoutes.push(createBusObject(1, barasat_korunamoyi));
  const dumdum_tollygunge = require('./routes/routeData/dumdum_tollygunge.js');
  busRoutes.push(createBusObject(2, dumdum_tollygunge));
  const esplanade_barrackpore = require('./routes/routeData/esplanade_barrackpore.js');
  busRoutes.push(createBusObject(3, esplanade_barrackpore));
  const howrah_airport = require('./routes/routeData/howrah_airport.js');
  busRoutes.push(createBusObject(4, howrah_airport));
  const newtown_howrah = require('./routes/routeData/newtown_howrah.js');
  busRoutes.push(createBusObject(5, newtown_howrah));
  const parkstreet_garia = require('./routes/routeData/parkstreet_garia.js');
  busRoutes.push(createBusObject(6, parkstreet_garia));
  const saltlake_dumdum = require('./routes/routeData/saltlake_dumdum.js');
  busRoutes.push(createBusObject(7, saltlake_dumdum));
  const sealdah_howrah_bridge = require('./routes/routeData/sealdah_howrah_bridge.js');
  busRoutes.push(createBusObject(8, sealdah_howrah_bridge));
  const sectorV_rajarhat = require('./routes/routeData/sectorV_rajarhat.js');
  busRoutes.push(createBusObject(9, sectorV_rajarhat));
  const shyambazar_behala = require('./routes/routeData/shyambazar_behala.js');
  busRoutes.push(createBusObject(10, shyambazar_behala));
  console.log(`📊 Successfully loaded ${busRoutes.length} bus routes!`);
} catch (error) {
  console.error('❌ Error loading route files:', error.message);
  console.log('🔄 Using default routes as fallback');
  initializeDefaultBuses();
}

// --- Helper Functions ---
function createBusObject(id, routeData) {
  const bus = {
    id,
    name: routeData.name || `Bus ${id}`,
    color: routeData.color || getColorById(id),
    coords: routeData.coords || [],
    stops: routeData.stops || [],
    currentStopIndex: 0,
    status: "moving",
    stopWaitTime: 0,
    acceleration: 1.0 + Math.random() * 0.4,
    deceleration: 1.8 + Math.random() * 0.4,
    maxSpeed: 50 + Math.random() * 20,
    minSpeed: 0,
    targetSpeed: 35 + Math.random() * 15,
    currentSpeed: 20 + Math.random() * 15,
    index: 0,
    progress: 0,
    totalRouteDistance: 0,
    distanceCovered: 0,
    current: [22.5726, 88.3639],
    passengers: 15 + Math.floor(Math.random() * 20),
    capacity: 50,
    nextStop: 0
  };
  
  if (bus.coords.length) {
    bus.totalRouteDistance = calculateRouteDistance(bus.coords);
    bus.nextStop = bus.stops.length ? bus.stops[0] : 0;
    const randomIndex = Math.floor(Math.random() * bus.coords.length);
    bus.index = randomIndex;
    bus.current = bus.coords[randomIndex];
    bus.distanceCovered = calculateRouteDistance(bus.coords.slice(0, randomIndex + 1));
  }
  
  return bus;
}

function getColorById(id) {
  const colors = [
    '#1f77b4',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#ff7f0e',
    '#17becf',
    '#e377c2',
    '#bcbd22',
    '#7f7f7f',
    '#8c564b',
    '#1a9850'
  ];
  return colors[(id - 1) % colors.length];
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = x => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calculateRouteDistance(coords) {
  if (!coords || coords.length < 2) return 0;
  let totalDistance = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    totalDistance += haversine(...coords[i], ...coords[i + 1]);
  }
  return totalDistance;
}

function getNextStopInfo(bus) {
  if (!bus.stops || bus.stops.length === 0 || !bus.coords) return { index: 0, distance: 0, coordinates: bus.current };
  const nextStopIndex = bus.stops[bus.currentStopIndex % bus.stops.length];
  if (nextStopIndex >= bus.coords.length) return { index: 0, distance: 0, coordinates: bus.current };
  const [stopLat, stopLon] = bus.coords[nextStopIndex];
  const distanceToStop = haversine(bus.current[0], bus.current[1], stopLat, stopLon);
  return { index: nextStopIndex, distance: distanceToStop, coordinates: [stopLat, stopLon] };
}

// --- Collision Detection ---
function checkForCongestion(bus) {
  const SAFETY_DISTANCE = 50;
  const currentPos = bus.current;
  
  for (const otherBus of busRoutes) {
    if (otherBus.id === bus.id || otherBus.status === "stopped") continue;
    const otherPos = otherBus.current;
    const distance = haversine(currentPos[0], currentPos[1], otherPos[0], otherPos[1]);
    if (distance < SAFETY_DISTANCE) {
      bus.targetSpeed = Math.max(5, bus.currentSpeed * 0.6);
      bus.status = "decelerating";
      console.log(`⚠️  Bus ${bus.id} slowing down to avoid Bus ${otherBus.id} (${Math.round(distance)}m)`);
      return true;
    }
  }
  return false;
}

// --- Speed Logic ---
function calculateStepwiseTargetSpeed(distanceToStop, currentSpeed) {
  if (distanceToStop > 300) return Math.min(currentSpeed + 5, 50);
  if (distanceToStop > 200) return 40;
  if (distanceToStop > 100) return 30;
  if (distanceToStop > 50) return 20;
  if (distanceToStop > 20) return 10;
  if (distanceToStop > 5) return 5;
  return 0;
}

function updateBusSpeed(bus) {
  const nextStopInfo = getNextStopInfo(bus);
  const distanceToStop = nextStopInfo.distance;
  if (bus.status === "stopped") { bus.currentSpeed = 0; return; }
  if (bus.status === "accelerating") {
    bus.currentSpeed = Math.min(bus.currentSpeed + bus.acceleration * 0.5, bus.targetSpeed);
    if (bus.currentSpeed >= bus.targetSpeed - 0.5) { bus.status = "moving"; }
    return;
  }
  if (distanceToStop < 300 && bus.status === "moving") {
    bus.status = "decelerating";
    bus.targetSpeed = calculateStepwiseTargetSpeed(distanceToStop, bus.currentSpeed);
  }
  if (bus.status === "decelerating") {
    bus.targetSpeed = calculateStepwiseTargetSpeed(distanceToStop, bus.currentSpeed);
    if (bus.currentSpeed > bus.targetSpeed) {
      bus.currentSpeed = Math.max(bus.targetSpeed, bus.currentSpeed - bus.deceleration * 0.5);
    }
    if (distanceToStop < 5 && bus.currentSpeed < 1) {
      bus.currentSpeed = 0;
      bus.status = "stopped";
      const stopCoord = bus.coords[bus.stops[bus.currentStopIndex]];
      bus.current = [stopCoord[0], stopCoord[1]];
      bus.index = bus.stops[bus.currentStopIndex];
      bus.progress = 0;
      bus.stopWaitTime = 15 + Math.random() * 10;
      handlePassengerActivity(bus);
    }
    return;
  }
  if (bus.status === "moving") {
    if (Math.random() < 0.1) { bus.targetSpeed = bus.maxSpeed - Math.random() * 15; }
    const speedDiff = bus.targetSpeed - bus.currentSpeed;
    if (Math.abs(speedDiff) > 0.5) {
      const accelerationRate = speedDiff > 0 ? bus.acceleration : bus.deceleration;
      bus.currentSpeed += Math.sign(speedDiff) * accelerationRate * 0.3;
    }
  }
  bus.currentSpeed = Math.max(bus.minSpeed, Math.min(bus.maxSpeed, bus.currentSpeed));
}

// --- Position Update ---
function updateBusPosition(bus) {
  if (!bus.coords || bus.coords.length === 0) return;
  if (bus.status === "stopped") return;
  if (bus.index >= bus.coords.length - 1) return resetBusToStart(bus);
  const [lat1, lon1] = bus.coords[bus.index];
  const [lat2, lon2] = bus.coords[bus.index + 1];
  const segmentDist = haversine(lat1, lon1, lat2, lon2);
  const speedMps = (bus.currentSpeed * 1000) / 3600;
  const step = speedMps * 1;
  if (step <= 0 || segmentDist <= 0) return;
  const frac = step / segmentDist;
  bus.progress += frac;
  if (bus.progress >= 1) {
    bus.index++;
    bus.progress = 0;
    bus.current = [lat2, lon2];
    bus.distanceCovered += segmentDist;
    if (bus.stops.includes(bus.index)) {
      bus.status = "stopped";
      bus.stopWaitTime = 15 + Math.random() * 10;
      bus.currentSpeed = 0;
      handlePassengerActivity(bus);
    }
  } else {
    const newLat = lat1 + (lat2 - lat1) * bus.progress;
    const newLon = lon1 + (lon2 - lon1) * bus.progress;
    const moved = haversine(bus.current[0], bus.current[1], newLat, newLon);
    bus.distanceCovered += moved;
    bus.current = [newLat, newLon];
  }
}

function handlePassengerActivity(bus) {
  const leaving = Math.floor(Math.random() * 8);
  const boarding = Math.floor(Math.random() * 12);
  bus.passengers = Math.max(0, bus.passengers - leaving);
  bus.passengers = Math.min(bus.capacity, bus.passengers + boarding);
}

function handleStoppedState(bus) {
  bus.stopWaitTime--;
  bus.currentSpeed = 0;
  if (bus.stopWaitTime <= 0) {
    bus.status = "accelerating";
    bus.targetSpeed = bus.maxSpeed - Math.random() * 10;
    bus.currentStopIndex = (bus.currentStopIndex + 1) % bus.stops.length;
    bus.nextStop = bus.stops[bus.currentStopIndex];
  }
}

function resetBusToStart(bus) {
  bus.index = 0;
  bus.progress = 0;
  bus.current = bus.coords.length ? bus.coords[0] : [22.5726, 88.3639];
  bus.distanceCovered = 0;
  bus.currentStopIndex = 0;
  bus.status = "moving";
  bus.targetSpeed = bus.maxSpeed - Math.random() * 10;
  bus.currentSpeed = 15 + Math.random() * 10;
  bus.nextStop = bus.stops.length ? bus.stops[0] : 0;
  bus.passengers = 15 + Math.floor(Math.random() * 20);
}

function updateBus(bus) {
  if (!bus.coords || bus.coords.length === 0) return;
  if (bus.status === "stopped") { handleStoppedState(bus); return; }
  const isCongested = checkForCongestion(bus);
  if (!isCongested) { updateBusSpeed(bus); updateBusPosition(bus); }
  else { updateBusSpeed(bus); }
}

function initializeDefaultBuses() {
  const defaultRoutes = [
    { id: 1, name: "NewTown – Howrah", color: "green", coords: [[22.595904, 88.380014], [22.596104, 88.380021]], stops: [1] },
    { id: 2, name: "Salt Lake – DumDum", color: "red", coords: [[22.539534, 88.352193], [22.540481, 88.352316]], stops: [1] },
    { id: 3, name: "Sector V – Rajarhat", color: "blue", coords: [[22.579749, 88.428817], [22.579753, 88.428813]], stops: [1] }
  ];
  defaultRoutes.forEach(route => {
    const bus = {
      ...route,
      currentStopIndex: 0,
      status: "moving",
      stopWaitTime: 0,
      acceleration: 1.2,
      deceleration: 2.0,
      maxSpeed: 60,
      minSpeed: 0,
      targetSpeed: 40,
      currentSpeed: 25 + Math.random() * 10,
      index: 0,
      progress: 0,
      totalRouteDistance: calculateRouteDistance(route.coords),
      distanceCovered: 0,
      current: route.coords[0],
      passengers: 15 + Math.floor(Math.random() * 20),
      capacity: 50,
      nextStop: route.stops[0]
    };
    busRoutes.push(bus);
  });
}

// --- Socket.IO ---
io.on('connection', socket => {
  console.log('✅ Client connected:', socket.id);
  socket.emit('busUpdate', getBusesData());
  
  socket.on('getBuses', () => { 
    socket.emit('busUpdate', getBusesData()); 
  });
  
  socket.on('selectBus', (busId) => {
    console.log(`📍 Bus ${busId} selected from live data section`);
    const details = getBusDetails(busId);
    // Emit to ALL clients including the sender
    io.emit('busSelected', details);
  });
});

function getBusDetails(busId) {
  const bus = busRoutes.find(b => b.id === parseInt(busId));
  if (!bus) return null;
  const nextStopInfo = getNextStopInfo(bus);
  return {
    id: bus.id,
    name: bus.name,
    color: bus.color,
    currentPosition: bus.current,
    speed: Math.round(bus.currentSpeed * 10) / 10,
    status: bus.status,
    nextStop: nextStopInfo,
    passengers: bus.passengers,
    capacity: bus.capacity,
    distanceCovered: Math.round(bus.distanceCovered / 1000 * 100) / 100,
    totalRouteDistance: Math.round(bus.totalRouteDistance / 1000 * 100) / 100,
    progress: bus.totalRouteDistance > 0 ? Math.round(bus.distanceCovered / bus.totalRouteDistance * 100) : 0
  };
}

// --- API ---
app.get('/api/buses', (req, res) => {
  const bulletIcons = ['🔴','🟢','🔵','🟣','🟠','🟤','⚫','🟡','🟢','🟠','🔵'];
  res.json(busRoutes.map(bus => ({
    id: bus.id,
    name: bus.name,
    color: bus.color,
    colorBullet: bulletIcons[(bus.id - 1) % bulletIcons.length],
    lat: bus.current[0],
    lon: bus.current[1],
    speed: Math.round(bus.currentSpeed * 10) / 10,
    status: bus.status,
    passengers: bus.passengers
  })));
});

app.get('/api/bus/:id', (req, res) => {
  const bus = busRoutes.find(b => b.id === parseInt(req.params.id));
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  const nextStopInfo = getNextStopInfo(bus);
  res.json({
    id: bus.id,
    name: bus.name,
    color: bus.color,
    currentPosition: bus.current,
    speed: Math.round(bus.currentSpeed * 10) / 10,
    status: bus.status,
    nextStop: nextStopInfo,
    passengers: bus.passengers,
    capacity: bus.capacity,
    distanceCovered: Math.round(bus.distanceCovered / 1000 * 100) / 100,
    totalRouteDistance: Math.round(bus.totalRouteDistance / 1000 * 100) / 100,
    progress: bus.totalRouteDistance > 0 ? Math.round(bus.distanceCovered / bus.totalRouteDistance * 100) : 0
  });
});

// --- Serve Frontend ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/index.html')));

// --- Buses Data ---
function getBusesData() {
  const busesData = {};
  const bulletIcons = ['🔴', '🟢', '🔵', '🟣', '🟠', '🟤', '⚫', '🟡', '🟢', '🟠', '🔵'];
  
  busRoutes.forEach(bus => {
    if (!bus.coords || bus.coords.length === 0) return;
    
    const nextStopInfo = getNextStopInfo(bus);
    const currentStopIndex = bus.currentStopIndex < bus.stops.length ? bus.stops[bus.currentStopIndex] : 0;
    const currentStopCoords = bus.coords[currentStopIndex] || bus.current;
    
    busesData[bus.id] = {
      id: bus.id,
      name: bus.name,
      color: bus.color,
      colorBullet: bulletIcons[(bus.id - 1) % bulletIcons.length],
      lat: bus.current[0],
      lon: bus.current[1],
      speed: Math.round(bus.currentSpeed * 10) / 10,
      distance: Math.round(bus.distanceCovered / 1000 * 100) / 100,
      totalDistance: Math.round(bus.totalRouteDistance / 1000 * 100) / 100,
      status: bus.status,
      nextStop: bus.nextStop,
      currentStopIndex: currentStopIndex,
      currentStopCoords: currentStopCoords,
      distanceToNextStop: Math.round(nextStopInfo.distance),
      passengers: bus.passengers,
      capacity: bus.capacity,
      waitTime: bus.stopWaitTime,
      progress: bus.totalRouteDistance > 0 ? Math.round(bus.distanceCovered / bus.totalRouteDistance * 100) : 0,
      route: bus.coords,
      stops: bus.stops
    };
  });
  return busesData;
}

// --- Simulation Loop ---
setInterval(() => {
  busRoutes.forEach(updateBus);
  io.emit('busUpdate', getBusesData());
}, 1000);

// --- Start Server ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚌 Bus-Karo Server running at http://localhost:${PORT}`);
  console.log(`📡 Socket.IO ready for real-time updates`);
  console.log(`🌐 API available at http://localhost:${PORT}/api/buses`);
});

// --- Graceful Shutdown ---
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => console.log('✅ Server stopped'));
});