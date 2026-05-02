const express = require("express")
const router = express.Router()
const getTransactionNotification = require("../controllers/notification.controller")

router.get("/:reference", getTransactionNotification)

module.exports = router;