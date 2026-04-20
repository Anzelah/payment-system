const express = require("express")
const router = express.Router()
const getTransactionStatus = require("../controllers/notification.controller")

router.get("/transactions/:reference", getTransactionStatus)

module.exports = router;