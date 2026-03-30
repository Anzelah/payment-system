const prisma = require("../utils/prisma")

class WebhookController {
    async stripeWebhook(req,res) {
        try {
            const payload = req.body

            // store the event first(we don't want to lose any transactions)
            await prisma.paymentEvent.create({
                data: {
                    type: payload.type || "unknown",
                    payload,
                    processed: false

                }
            })
            console.log("Stripe webhook stored")
            return res.json({ received: true })
        } catch(error) {
            console.error("Stripe webhook error:", error);
            return res.status(500).json({ error: "Webhook error" });
        }
    }

}