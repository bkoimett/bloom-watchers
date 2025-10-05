const express = require("express");
const axios = require("axios");
const BloomData = require("../models/BloomData");
const router = express.Router();

const PYTHON_API = (
  process.env.PYTHON_API_URL ||
  "https://ndvi-api-production-2c07.up.railway.app"
).replace(/\/$/, ""); // remove trailing slash

router.post("/", async (req, res) => {
  const { city, date } = req.body || {};
  if (!city || !date) {
    return res.status(400).json({ error: "city and date are required" });
  }

  try {
    // Forward to Python API
    const response = await axios.post(
      `${PYTHON_API}/predict`,
      { city, date },
      { timeout: 10000 }
    );
    const data = response.data;

    // Save prediction to MongoDB for history/analysis
    const saved = await BloomData.create({
      county: data.city,
      date: new Date(data.date),
      ndvi: data.predicted_ndvi,
      anomaly: data.anomaly ? "predicted" : null,
      rainfall: null,
      lat: data.latitude,
      lon: data.longitude,
    });

    console.log("Prediction saved:", saved._id);
    return res.json(data);
  } catch (err) {
    console.error("Prediction error:", err.message);
    return res
      .status(500)
      .json({ error: "Prediction failed", details: err.message });
  }
});

module.exports = router;
