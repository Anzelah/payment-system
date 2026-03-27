const prisma = require('../utils/prisma')
const paymentService = require("../app")
const { v4: uuidv4 } = require("uuid")

async function createPayment (req, res) {
    try {
        // validate inputs
        const { userId, amount, currency, provider, idempotencyKey } = req.body

        if (!userId || !amount || !currency || !provider ||!idempotencyKey ) { //to replace with zod validation
            return res.status(400).json({ error: "Missing required fields" })
        }

        //check for double transaction 
        const existingTransaction = await prisma.transaction.findUnique({
            where: { idempotencyKey }
        })
        if (existingTransaction) {
            return res.status(200).json(existingTransaction)
        }

        // create the transaction in the db
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                provider: provider.toUpperCase(),
                reference: `ref_${Date.now()}`,
                amount,
                currency,
                status: "PENDING",
                idempotencyKey
            }
        })

        // call payment service to process the payment now
        const response = await paymentService.createPayment(
            provider,
            { amount, currency, reference: transaction.reference } )

        return res.status(201).json({
            message: "Payment inititated succesfully",
            transaction, 
            providerResponse: response
        })
    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong"})
    }
}


module.exports = { createPayment }