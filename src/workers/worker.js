const { Worker, Job } = require("bullmq")
const paymentQueue = require("../queues/payment.queue")
const connection = require("../utils/redis")

const worker = new Worker('payment', 
    async job => {
        // process job here
    },
    { connection }
);

worker.on('completed', job => {
    console.log(`Job ${job.id} completed!`)
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed with ${err}`)
});
