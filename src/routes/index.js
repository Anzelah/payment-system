const express = require("express");
const router = express.Router();

const paymentRoutes = require("./payment.route");
const mpesaWebhookRoute = require("./mpesaWebhook.routes");
const notificationRoutes = require("./notification.route")
const refundsRoute = require("./refund.route")

router.use("/payments", paymentRoutes);
router.use("/webhooks/mpesa", mpesaWebhookRoute);
router.use("/notifications", notificationRoutes);
router.use("/refunds", refundsRoute)

module.exports = router;