const express = require("express")
const paymentController = require("./controllers/payment.controller")

const router = express.Router()

router.post("/payments", (req, res) => {
    paymentController()
})

module.exports = router;