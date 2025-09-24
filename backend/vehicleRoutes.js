const express = require('express');
const router = express.Router();

// Hard-coded vehicles for demo
let vehicles = [
  { vehicleId: 1, currentLocation: { lat: 22.5726, lng: 88.3639 } },
  { vehicleId: 2, currentLocation: { lat: 22.5735, lng: 88.3645 } },
  { vehicleId: 3, currentLocation: { lat: 22.5745, lng: 88.3655 } },
];

router.get('/', (req, res) => {
  res.json(vehicles);
});

module.exports = router;
