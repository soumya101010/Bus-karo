// backend/routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// Get all vehicles
router.get('/', async (req, res) => {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
});

// Update vehicle location
router.put('/:id', async (req, res) => {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(vehicle);
});

module.exports = router;
