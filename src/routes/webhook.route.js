const express = require("express");
const router = express.Router();

router.post("/stripe", (req, res) => webhookController.stripeWebhook(req, res)) // add /webhook in server.js
router.post("/mpesa", (req, res) => webhookController.mpesaCallback(req, res))

module.exports = router;