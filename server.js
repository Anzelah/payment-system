require("dotenv").config()
const express = require("express")
const PORT = process.env.PORT || 5000
const paymentRoutes = require("./routes/payment.route")

const app = express()
app.use(express.json())

//register routes
app.use("/api", paymentRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
