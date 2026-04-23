const express = require("express")
const router = express.Router()
const validateMiddleware = require("/middlewares/validate")
const processRefunds = require("../controllers/refund.controller")

router.post("/", processRefunds)

module.exports = router