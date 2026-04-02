const prisma = require("../utils/prisma")
const paymentQueue = require("../queues/payment.queue")

class WebhookController {
    async stripeWebhook(req, res) {
        try {
            const payload = req.body
            const stripeEventId = payload.id

            // check for duplicate webhooks
            const existingEvent = await prisma.paymentEvent.findUnique({
                where: { eventId: stripeEventId }
            })
            if (existingEvent) {
                console.log("Duplicate webhook")
                return res.json({ received: true })
            }
            let event;

            // store the event first(we don't want to lose any transactions)
            event = await prisma.paymentEvent.create({
                data: {
                    eventId: stripeEventId,
                    type: payload.type || "unknown",
                    payload,
                    processed: false

                }
            })
            console.log("Stripe webhook stored")

            // add to queue
            await paymentQueue.add( 'stripe-event', { eventId: event.id }, // db id
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                },
            );
            console.log("Stripe payment queued")

            return res.json({ received: true })
        } catch(error) {
            console.error("Stripe webhook error:", error);
            return res.status(500).json({ error: "Webhook error" });
        }
    }

    async mpesaCallback( req, res) {
        try {
            const payload = req.body
            const mpesaEventId = payload.Body.stkCallback.CheckoutRequestID;

            // check for duplicate webhooks
            const existingEvent = await prisma.paymentEvent.findUnique({
                where: { eventId: mpesaEventId }
            })
            if (existingEvent) {
                console.log("Duplicate webhook")
                return res.json({ received: true })
            }

            // store the event first(we don't want to lose any transactions)
            const event = await prisma.paymentEvent.create({
                data: {
                    eventId: mpesaEventId
                    type: "mpesa_callback",
                    payload,
                    processed: false

                }
            })
            console.log("Mpesa callback stored")

            // push to queue
            await paymentQueue.add('mpesa-event', { eventId: event.id },
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                },
            );
            console.log("Mpesa payment queued")

            return res.json({ received: true })
        } catch(error) {
            console.error("Mpesa callback error:", error);
            return res.status(500).json({ error: "callback error" });
        }

    }

}

module.exports = new WebhookController();