const express = require("express")
const router = express.Router()
const getTransactionNotification = require("../controllers/notification.controller")

router.get("/:reference/notification", getTransactionNotification)

module.exports = router;