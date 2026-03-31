const { Worker, Job } = require("bullmq")
const paymentQueue = require("../queues/payment.queue")
const connection = require("../utils/redis")
const prisma = require("../utils/prisma")

const worker = new Worker('payment', 
    async job => {
        // process job here
        const { eventId } = job.data

        // worker fetches event from database
        const event = await prisma.paymentEvent.findUnique({
            where: { id: eventId}
        })
        if (!event) {
            throw new Error("Event not found");
        }
        console.log("Processing event:", event.type);
      

        // retrieve the event payload which contains stripe/mpesa message details
        const payload = event.payload
        const reference = payload.data?.object?.id
        if (!reference) {
            console.log("No reference found in payload");
            return;
        }

        // find the transaction in our records
        const transaction = await prisma.transaction.findFirst({
            where: { reference }
        })
        if (!transaction) {
            console.log("Transaction not found for reference:", reference);
            return;
        }

        // update transaction status in db
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCESS' }
        })
        console.log("Transaction updated to SUCCESS");

        
        // Mark event as processed.
        await prisma.paymentEvent.update({
            where: { id: event.id },
            data: { processed: true },
        })
        console.log("Event updated to processed");
    },
    { connection }
);

worker.on('completed', job => {
    console.log(`Job ${job.id} completed!`)
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed with ${err}`)
});
