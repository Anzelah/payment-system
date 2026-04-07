const prisma = require('../utils/prisma')
const paymentService = require("../app")
const { randomUUID } = require("crypto")

async function createPayment (req, res) {
    try {
        // validate inputs
        const { userId, amount, currency, provider, idempotencyKey, phone } = req.body

        if (!userId || !amount || !currency || !provider ||!idempotencyKey ) { //to replace with zod validation middleware
            return res.status(400).json({ error: "Missing required fields" })
        }

        // A user clicks twice unintentionally 
        const existingTransaction = await prisma.transaction.findUnique({
            where: { idempotencyKey }
        })
        if (existingTransaction) {
            return res.status(200).json(existingTransaction)
        }
        
        // A user grew impatient and tried to repeat the same transaction
        const recentTransaction = await prisma.transaction.findFirst({
            where: {
                userId,
                amount,
                currency,
                status: "PENDING",
                createdAt: { 
                    gte: new Date(Date.now() - 5 * 60 * 1000) // last 5 minutes
                },
            },
        })
        if (recentTransaction) {
            return res.status(200).json({ message: "A similar transaction is underway"})
        }

        // create the transaction in the db
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                provider: provider.toUpperCase(),
                reference: `ref_${randomUUID()}`,
                amount,
                currency,
                status: "PENDING",
                idempotencyKey
            }
        })

        // call payment service to process the payment now
        const response = await paymentService.createPayment(
            provider,
            { amount, currency, reference: transaction.reference, transactionId: transaction.id, phone })

        return res.json({ url: response.url })
    } catch(error) { // to replace with error handler middleware
        console.error(error)
        res.status(500).json({ error: "Something went wrong"})
    }
}


module.exports = createPayment 