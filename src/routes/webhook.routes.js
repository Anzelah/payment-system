const express = require("express");
const router = express.Router();
const axios = require("axios")
const webhookController = require("../controllers/webhook.controller")

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/stripe", express.raw({ type: "application/json" }), async(req, res, next) => {
    let event;
    // Verify stripe signature
    const sig = req.headers['stripe-signature']
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        ) 
        req.stripeEvent = event
        next()
    } catch(error) {
        console.error("Webhook signature verification failed:", error.message);
        return res.status(400).send(`Webhook error:  ${error.message}`)
    }
}, webhookController.stripeWebhook)

router.post("/mpesa", webhookController.mpesaCallback)

module.exports = router;