const express = require("express");
const router = express.Router();

const paymentRoutes = require("./payment.route");
const webhookRoutes = require("./webhook.routes");
const notificationRoutes = require("./notification.route")

router.use("/payments", paymentRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/transactions", notificationRoutes);

module.exports = router;