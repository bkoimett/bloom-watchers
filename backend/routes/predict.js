const express = require("express");
const axios = require("axios");
const router = express.Router();
const PYTHON_API = process.env.PYTHON_API_URL;

// POST /api/predict
router.post("/", async (req, res) => {
  const { city, date } = req.body;

  if (!city || !date) {
    return res.status(400).json({ error: "city and date are required" });
  }

  try {
    // forward request to Python FastAPI endpoint
    const response = await axios.post(`${PYTHON_API}/predict`, { city, date });
    res.json(response.data);
  } catch (err) {
    console.error("Prediction fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch prediction" });
  }
});

module.exports = router;
