const { Queue } = require("bullmq")
const connection = require("../utils/redis")

const paymentQueue = new Queue('payment-events', { connection })

module.exports = paymentQueue;