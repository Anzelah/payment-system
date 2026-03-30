const express = require("express");
const router = express.Router();
const webhookController = require("./controllers/webhook.controller")

router.post("/stripe", express.raw({ type: "application/json" }), webhookController.stripeWebhook)
router.post("/mpesa", webhookController.mpesaCallback)

module.exports = router;