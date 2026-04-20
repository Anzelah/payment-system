const express = require("express")
const router = express.Router()
const notificationController = require("../controllers/notification.controller")

router.get("/transactions/:reference", notificationController.getUserMessage)