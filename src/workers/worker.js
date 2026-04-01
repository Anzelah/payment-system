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

    // retrieve provider message details and extract transaction reference for subsequent db search
    const payload = event.payload
    const reference = payload?.data?.object?.id
    if (!reference) {
        console.log("No reference in this payload")
        return;
    }

    // retrieve the transcaction we need to update then update status
    const transaction = await prisma.transaction.findMany({
        where: { reference }
    })
    if(!transaction) {
        console.log("No transaction for this reference")
        return
    }
    if (transaction.status === 'SUCCESS') { // have i already marked this order as paid
        console.log("Transaction already updated")
        return;
    }
    console.log("Transaction for the reference retrieved from database")

    await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "SUCCESS" },
    })
    console.log("Transaction status updated in database")

    // Mark event as done
    await prisma.paymentEvent.update({
        where: { id: event.id },
        data: { processed: true }
    })
    console.log("Event marked as processed")
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
