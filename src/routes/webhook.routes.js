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



router.post("/mpesa", async(req, res, next) => {
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET

    // BASE64 encode cnsumer key + secret
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

    // get access token
    try {
        const response = await axios.get(url,
        { headers: {
            Authorization: `Basic ${auth}`
        } 
        })
        req.token = response.access_token
        next()
    } catch (error) {
        console.error(`Failed to generate access token: ${error.message}`)
        return res.status(401).json({ error: "Incorrect or expired access token"})
    }
}, webhookController.mpesaCallback)

module.exports = router;