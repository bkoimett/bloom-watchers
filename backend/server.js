// near other requires
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

// existing routes
const bloomsRouter = require("./routes/blooms");
app.use("/api/blooms", bloomsRouter);

// add this:
const predictRouter = require("./routes/predict");
app.use("/api/predict", predictRouter);

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));
