const prisma = require("../utils/prisma")
const stripe = require("../utils/stripe")

async function processPayments(req, res) {
    const { reference } = req.body
    const transaction = await prisma.transaction.findUnique({
        where: { reference }
    })

    if (!transaction) {
        return res.status(404).json({ error: "Transaction for this reference not found"})
    }

    switch (transaction.status) {
        case "PROCESSING":
        case "PENDING":
            res.status(403).json({ error: "Cannot process this request as payment is still processing. Try again later" })
            break;

        case "FAILED":
            res.status(403).json({ error: "Cannot process this request as the initial payment failed"})
            break

        case "REFUNDED":
            res.status(403).json({ error: "Cannot process this request as a refund has already been made"})
            break;

        case "SUCCESS":
            // refund implementation here
            const refund = await stripe.refunds.create({
                
            })
            break;

        default:
            console.log("[REFUND FAILED] due to unknown transaction status", { transactionId: transaction.id })
            res.status(500).json({ error: "Unknown request failed to process"})
    }
}

module.exports = processPayments;