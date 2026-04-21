const express = require("express");
const router = express.Router();

const paymentRoutes = require("./payment.route");
const mpesaWebhookRoute = require("./mpesaWebhook.routes");
const notificationRoutes = require("./notification.route")

router.use("/payments", paymentRoutes);
router.use("/webhooks/mpesa", mpesaWebhookRoute);
router.use("/transactions", notificationRoutes);

module.exports = router;