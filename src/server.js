require("dotenv").config()
require("./workers/worker")
const express = require("express")
const cors = require("cors")
const PORT = process.env.PORT || 5000
const routes = require('./routes/index');
const stripeWebhookRoute = require("./routes/stripeWebhook.routes");

const app = express()
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: false,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// register stripe webhook before express.json()
app.use("/api/webhooks/stripe", stripeWebhookRoute)
app.use(express.json())
app.use("/api", routes)

const path = require("path");

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})