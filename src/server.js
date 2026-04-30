require("dotenv").config()
const express = require("express")
const cors = require("cors")
const PORT = process.env.PORT || 5000
const routes = require('./routes/index');
const stripeWebhookRoute = require("./routes/stripeWebhook.routes");

const app = express()
app.use(cors())

// register stripe webhook before express.json()
app.use("/api/webhooks/stripe", stripeWebhookRoute)
app.use(express.json())
app.use("/api", routes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})