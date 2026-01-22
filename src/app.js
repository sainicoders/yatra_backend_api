const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes")
const flightRoutes = require("./routes/flights/flight.routes");
const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://yatra0.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json());
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});
// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes) ;
app.use("/api/flights", flightRoutes);


app.get("/", (req, res) => {
  res.send("Yatra Backend Running ");
});

module.exports = app;
