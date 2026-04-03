const { Worker } = require("bullmq")
const paymentQueue = require("../queues/payment.queue")
const connection = require("../utils/redis")
const prisma = require("../utils/prisma")

// Worker processing the job
async function processPaymentJob(job) {
    const { eventId } = job.data

    // retrieve the event/job from database for processing
    const event = await prisma.paymentEvent.findUnique({
        where: { id: eventId }
    })
    if (!event) {
        throw new Error("Event not found")
    }
    if(event.processed) { // have i already seen this order?
        console.log("Event already processed")
        return;
    }
    console.log("Payment event retrieved")

    // retrieve stripe's sent payload/event
    const payload = event.payload
    const session = payload.data.object
    const reference = session.metadata.reference

    // retrieve the transaction we need to update then update status
    const transaction = await prisma.transaction.findUnique({
        where: { id: event.transactionId }
    })
    if(!transaction) {
        console.log("No transaction for this reference:", reference)
        return
    }
    if (transaction.status === 'SUCCESS') { // have i already marked this order as paid
        console.log("Transaction already updated")
        return;
    }
    console.log("Transaction for the reference retrieved from database")

    switch (event.type) {
        case "checkout.session.completed":
            const result = await prisma.transaction.updateMany({
                where: {
                    id: transaction.id,
                    status: 'PENDING',
                },
                data: { status: "SUCCESS" },
            })
            console.log("Transaction status updated as SUCCESS")
            if(result.count === 0) {
                console.log("Transaction already updated by another worker")
                return;
            }

            // Mark event as done
            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
            console.log("Event marked as processed")
            break;
        case "payment_intent.payment_failed":
            await prisma.transaction.updateMany({
                where: {
                    id: transaction.id,
                    status: 'PENDING',
                },
                data: { status: "FAILED" },
            })
            console.log("Transaction status updated as FAILED")

            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
            await prisma.paymentEvent.update({
                where: { id: event.id },
                data: { processed: true }
            })
        }
}

const worker = new Worker('payment', async(job) => {
    try {
        await processPaymentJob(job)
    } catch(error) {
        console.error("Worker error:", error)
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
