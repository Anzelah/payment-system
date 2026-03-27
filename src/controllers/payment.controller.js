const prisma = require('..utils/prisma')
const paymentService = require("../../app")
const { v4: uuidv4 } = require("uuid")

async function createPayment (req, res) {
    try {
        // validate inputs
        const { userId, amount, currency, provider } = req.body

        if (!userId || !amount || !currency || !provider ) { //to replace with zod validation
            return res.status(400).json({ error: "Missing required fields" })
        }

        //create idempotency keys(temporary)
        const idempotencyKey = uuidv4()
        const existingTransaction = await prisma.transaction.findUnique({
            where: { idempotencyKey }
        })
        if (existingTransaction) {
            return res.status(200).json({ message: "A similar transaction is underway"})
        }

        // create the transaction in the db
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                provider: provider.toUppercase(),
                reference: `ref_${Date.now()}`,
                amount,
                currency,
                status: "PENDING",
                idempotencyKey
            }
        })

        // call payment service to process the payment now
        const response = paymentService.createPayment(provider, { amount, currency, reference: transaction.reference } )

        return res.status(201).json({ message: "Payment inititated succesfully", transaction, response })
    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong"})
    }
}