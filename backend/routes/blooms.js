// backend/routes/blooms.js
const express = require("express");
const router = express.Router();
const BloomData = require("../models/BloomData");

// GET /api/blooms  (optionally ?county=&year=&start=&end=)
router.get("/", async (req, res) => {
  try {
    const { county, year, start, end, limit = 1000 } = req.query;
    const q = {};
    if (county) q.county = county;
    if (year)
      q.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    if (start || end) {
      q.date = {};
      if (start) q.date.$gte = new Date(start);
      if (end) q.date.$lte = new Date(end);
    }
    const data = await BloomData.find(q)
      .limit(parseInt(limit))
      .sort({ date: 1 });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bloom data" });
  }
});

// POST /api/blooms (single)
router.post("/", async (req, res) => {
  try {
    const doc = new BloomData(req.body);
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/blooms/bulk (insert many)
router.post("/bulk", async (req, res) => {
  try {
    const arr = req.body; // expect array
    arr.forEach((item) => {
      item.date = new Date(item.date);
    });
    const docs = await BloomData.insertMany(arr);
    res.json({ inserted: docs.length });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
