const express = require("express")
const createPayment = require("../controllers/payment.controller")
const router = express.Router()
const validateMiddleware = require("../middlewares/validate")
const { createPaymentSchema } = require("../validators/paymentSchema")

router.post("/", validateMiddleware(createPaymentSchema), createPayment)

module.exports = router;