const express = require("express");
const axios = require("axios");
const BloomData = require("../models/BloomData");
const router = express.Router();

const PYTHON_API = (
  process.env.PYTHON_API_URL ||
  "https://ndvi-api-production-2c07.up.railway.app"
).replace(/\/$/, "");

router.post("/", async (req, res) => {
  const { county, date } = req.body || {};
  if (!county || !date) {
    return res.status(400).json({ error: "county and date are required" });
  }

  try {
    const response = await axios.post(
      `${PYTHON_API}/predict`,
      { county, date },
      { timeout: 15000 }
    );

    const data = response.data;

    const saved = await BloomData.create({
      county: data.county,
      date: new Date(data.date),
      ndvi: data.predicted_ndvi,
      anomaly: data.anomaly ? "predicted" : null,
      rainfall: null,
      lat: data.latitude,
      lon: data.longitude,
    });

    console.log("✅ Prediction saved:", saved._id);
    return res.json(data);
  } catch (err) {
    console.error("❌ Prediction error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Prediction failed",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;
