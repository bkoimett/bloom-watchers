// backend/scripts/seedMock.js
const mongoose = require("mongoose");
const BloomData = require("../models/BloomData");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

async function seed() {
  const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/bloomdb";
  await mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const file = path.join(__dirname, "..", "data", "mock_blooms.json");
  if (!fs.existsSync(file)) {
    console.error("mock_blooms.json not found");
    process.exit(1);
  }
  const raw = fs.readFileSync(file);
  const arr = JSON.parse(raw).map((d) => ({ ...d, date: new Date(d.date) }));
  await BloomData.deleteMany({});
  const docs = await BloomData.insertMany(arr);
  console.log("Inserted", docs.length, "mock bloom records");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
