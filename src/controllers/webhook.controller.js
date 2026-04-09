const prisma = require("../utils/prisma")
const paymentQueue = require("../queues/payment.queue")
const { checkout } = require("../routes/webhook.routes")

class WebhookController {
    async stripeWebhook(req, res) {
        try {
            const event = req.stripeEvent // already verified
            const stripeEventId = event.id // stripe's own event_id sent with every webhook

            if (!stripeEventId) {
                return res.status(400).json({ error: "Invalid payload" })
            }

            // pre-check for duplication
            const existingEvent = await prisma.paymentEvent.findUnique({
                where: { eventId: stripeEventId }
            })
            if(existingEvent) {
                return res.status(200).json({ received: true })
            }

            const session = event.data.object
            const transactionId = session.metadata.transactionId
            // store the event first(we don't want to lose any transactions)
            const paymentEvent = await prisma.paymentEvent.create({
                data: {
                    eventId: stripeEventId,
                    transactionId,
                    type: event.type || "unknown",
                    payload: event,
                    processed: false
                }
            })
            console.log("Stripe webhook stored")

            // add to queue
            await paymentQueue.add( 'stripe-event', { eventId: paymentEvent.id }, // db id
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
            if (error.code === "P2002") {
                console.log("Duplicate webhook")
                return res.status(200).json({ received: true })  
            }
            console.error("Stripe webhook error:", error);
            return res.status(500).json({ error: "Webhook error" });
        }
    }

    async mpesaCallback( req, res) {
        try {
            const payload = req.body
            console.log("Mpesa callback received:", JSON.stringify(payload))

            const stkCallback = payload.Body.stkCallback
            if (!stkCallback) {
                return res.json({ ResultCode: 0, ResultDesc: "Accepted" })
            }
            
            const { CheckoutRequestID } = stkCallback;

            // pre-check for duplicate callbacks
            const existingEvent = await prisma.paymentEvent.findUnique({
                where: { eventId: CheckoutRequestID }
            })
            if (existingEvent) {
                return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" })
            }

            // store the event first(we don't want to lose any transactions)
            const event = await prisma.paymentEvent.create({
                data: {
                    eventId: CheckoutRequestID,
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

            return res.json({ ResultCode: 0, ResultDesc: "Accepted" })
        } catch(error) {
            console.error("Mpesa callback error:", error);
            return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
        }
    }
}

module.exports = new WebhookController();