const express = require("express");
const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), webhookController.stripeWebhook)
router.post("/mpesa", webhookController.mpesaCallback)

module.exports = router;