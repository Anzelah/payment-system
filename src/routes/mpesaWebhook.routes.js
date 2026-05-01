const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhook.controller")

router.post("/", webhookController.mpesaCallback)

module.exports = router;