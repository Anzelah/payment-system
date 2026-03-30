require("dotenv").config()
const express = require("express")
const PORT = process.env.PORT || 5000
const routes = require('./routes/index');

const app = express()
app.use(express.json())

//register routes
app.use("/api", routes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})