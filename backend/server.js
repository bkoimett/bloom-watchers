// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/bloomdb";
mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error", err));

// Routes
const bloomsRouter = require("./routes/blooms");
const predictRouter = require("./routes/predict");

app.use("/api/blooms", bloomsRouter);
app.use("/api/predict", predictRouter);

// quick health
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
