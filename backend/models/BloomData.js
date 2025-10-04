// backend/models/BloomData.js
const mongoose = require("mongoose");

const BloomDataSchema = new mongoose.Schema({
  county: { type: String, required: true },
  date: { type: Date, required: true },
  ndvi: { type: Number, required: true }, // 0..1
  anomaly: { type: String, default: null }, // e.g. "hyacinth"
  rainfall: { type: Number, default: null }, // mm or normalized
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
});

module.exports = mongoose.model("BloomData", BloomDataSchema);
