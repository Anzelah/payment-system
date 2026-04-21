const { Worker } = require("bullmq")
const paymentQueue = require("../queues/payment.queue")
const connection = require("../utils/redis")
const prisma = require("../utils/prisma")

// Worker processing the job
async function processStripePayment(job) {
    const { paymentEventId } = job.data

    // retrieve the event/job from database for processing
    const event = await prisma.paymentEvent.findUnique({
        where: { id: paymentEventId }
    })
    console.log(event)
    if (!event) {
        throw new Error("Event not found")
    }
    if(event.processed) { // have i already seen this order?
        console.log("[WORKER] Already Processed Event", event.id)
        return;
    }
    console.log("[WORKER] Processing Event", event.id)

    // retrieve stripe's sent payload/event
    const payload = event.payload
    console.log(payload)
    const session = payload.data.object

    // retrieve the transaction we need to update then update status
    const transaction = await prisma.transaction.findUnique({
        where: { id: event.transactionId }
    })
    if(!transaction) {
        console.log("[WORKER ERROR] Transaction not found", { eventIdp: event.eventId, });
        return
    }
    if (transaction.status !== "PENDING") { // have i already marked this order as paid
        console.log("[WORKER ERROR] Transaction already processed", { eventIdp: event.eventId, });
        return;
    }
    console.log("[WORKER] Fetching Transaction:", { transactionId: transaction.id, eventIdp: event.eventId })

    switch (event.type) {
        case "payment_intent.succeeded":
            const result = await prisma.transaction.updateMany({
                where: {
                    id: transaction.id,
                    status: 'PENDING',
                },
                data: { status: "SUCCESS" },
            })
            if(result.count === 0) {
                console.log("[RACE CONDITION ERROR] Transaction already processed by another worker", { transactionId: transaction.id });
                return;
            }
            console.log("[PAYMENT SUCCESS]", { transactionId: transaction.id });

            // Mark event as done
            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
            console.log("[PAYMENT EVENT PROCESSED]:", { eventId: event.id, type: event.type })
            break;

        case "payment_intent.payment_failed":
            await prisma.transaction.updateMany({
                where: {
                    id: transaction.id,
                    status: 'PENDING',
                },
                data: { status: "FAILED" },
            })
            if (result.count === 0) return;
            console.log("[PAYMENT FAILED]", { transactionId: transaction.id });

            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
            console.log("[PAYMENT EVENT PROCESSED]:", { eventId: event.id, type: event.type })
            break;

        default:
            // checkout.session.completed should remain on processing.
            console.log("[WORKER ERROR] Unhandled job type", event.type)
            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
            console.log("[PAYMENT EVENT PROCESSED]:", { eventId: event.id, type: event.type })
        }
}

async function processMpesaPayment(job) {
    const { paymentEventId } = job.data
    const event = await prisma.paymentEvent.findUnique({
        where: { id: paymentEventId }
    })

    if (!event) {
        throw new Error("Event not found")
    }

    if (event.processed) {
        console.log("[WORKER] Already Processed Event", event.id)
        return;
    }
    console.log("[WORKER] Processing Event:", event.id)

    // retreive the transaction for this event
    const transaction = await prisma.transaction.findUnique({
        where: { checkoutRequestId: event.eventId }
    })
    if(!transaction) {
        console.log("[WORKER ERROR] Transaction not found", { eventIdp: event.eventId, });
        return;
    }
    if (transaction.status !== "PENDING") {
        console.log("[WORKER ERROR] Transaction already processed", { eventIdp: event.eventId, });
        return;
    }
    console.log("[WORKER] Fetching Transaction:", { transactionId: transaction.id, eventIdp: event.eventId })

    //MPESA WEBHOOK/CALLBACK IMPLEMENTATION HERE
    const payload = event.payload
    const stkCallback = payload.Body.stkCallback
    const { ResultCode, ResultDesc } = stkCallback

    switch(ResultCode) {
        case 0:
            const result = await prisma.transaction.updateMany({
                where: { 
                    id: transaction.id,
                    status: "PENDING"
                },
                data: { status: "SUCCESS" }
            })
            if (result.count === 0) {
                console.log("[RACE CONDITION ERROR] Transaction already processed by another worker", { transactionId: transaction.id });
                return;
            }
            console.log("[PAYMENT SUCCESS]", { transactionId: transaction.id });

            // mark event as processed
            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
            console.log("[PAYMENT EVENT PROCESSED]:", { eventId: event.id, type: event.type })
            break;

        // TO ADD RETRY LOGIC FOR SOME CODES
        case 1037:
        case 1019:
        case 1001:
        case 1032:
        case 2001:
            const results = await prisma.transaction.updateMany({
                where: {
                    id: transaction.id,
                    status: 'PENDING',
                },
                data: { status: "FAILED" },
            })
            if (results.count === 0) return;
            console.log("[PAYMENT FAILED]", { transactionId: transaction.id });

            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
            console.log("[PAYMENT EVENT PROCESSED]:", { eventId: event.id, type: event.type })
            break;

        default: // unsure as to update transaction as failed here too
            console.log(`Transaction failed: ${ResultDesc}.`);
            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
            console.log("[PAYMENT EVENT PROCESSED]:", { eventId: event.id, type: event.type })
    }
}


const worker = new Worker('payment-events', async(job) => {
    try {
        switch(job.name) {
            case 'stripe-event':
                await processStripePayment(job)
                break;
            case 'mpesa-event':
                await processMpesaPayment(job)
                break;
            default:
                console.log("[WORKER ERROR] Unknown job type", job.name)
                return;
        } 
    } catch(error) {
        console.error("[WORKER ERROR] 500:", error)
        throw error
    }
},
{ connection });

worker.on('completed', job => {
    console.log(`Job ${job.id} completed!`)
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with ${err}`)
});
