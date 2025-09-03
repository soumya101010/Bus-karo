// backend/models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleId: String,
    type: String,
    currentLocation: {
        lat: Number,
        lng: Number
    },
    routeId: String
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
