const prisma = require("../utils/prisma")
const stripe = require("../utils/stripe")

async function processRefunds(req, res) {
    const { reference } = req.params
    if (!reference) {
        return res.status(400).json({ error: "Missing required reference" })
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { reference }
        })

        if (!transaction) {
            return res.status(404).json({ error: "Transaction for this reference not found"})
        }
        if (!transaction.paymentIntentId) {
            return res.status(400).json({ error: "Transaction missing required payment intent id" })
        }

        switch (transaction.status) {
            case "PROCESSING":
            case "PENDING":
                return res.status(403).json({ error: "Payment is still processing. Try again later" })

            case "FAILED":
                return res.status(403).json({ error: "Cannot refund a failed payment"})

            case "REFUNDED":
                return res.status(403).json({ error: "This transaction has already been refunded"})

            case "SUCCESS":
                // retrieve requested refund amount from client
                const amount = req.body.amount
                if (!amount || amount <= 0) {
                    return res.status(400).json({ error: "Missing required field amount or invalid refund amount"})
                }

                // retrieve all refunds for the transaction id and calculate amount already refunded
                const refunds = await prisma.refund.findMany({
                    where: { transactionId: transaction.id }
                })
                console.log("Refunds retrieved from database")

                // calculate the remaining amount we do have for that transaction id
                const alreadyRefunded = refunds.reduce((total, r) => {
                    return total += r.amount
                }, 0)
                const originalAmount = transaction.amount
                console.log(`Original Amount ${originalAmount}`)
                const remainingAmount = originalAmount - alreadyRefunded
                console.log(`Remaining amount in db: ${remainingAmount}` )

                // check that requested refund isnt more than remaining amount
                if (amount > remainingAmount) {
                    return res.status(400).json({ error: `Refund exceeds remaining amount. Remaining: ${remainingAmount}`})
                } 

                const stripeRefund = await stripe.refunds.create({
                    payment_intent: transaction.paymentIntentId,
                    amount: amount * 100, 
                    reason: "requested_by_customer" // in frontend, user will choose the reason then autofill here
                })
                console.log("[PARTIAL REFUND PROCESSING INITIATED]", { stripeRefundId: stripeRefund.id }); 

                // create it even if refund_status is pending/failed.
                await prisma.refund.create({
                    data: {
                        transactionId: transaction.id,
                        amount,
                        reason: stripeRefund.reason,
                        stripeRefundId: stripeRefund.id,
                        status: stripeRefund.status
                    }
                })
                console.log("[REFUND PROCESSED]", { stripeRefundId: stripeRefund.id, status: stripeRefund.status });

                if (stripeRefund.status === "succeeded" && amount === remainingAmount) {
                    await prisma.transaction.update({
                        where: { reference },
                        data: { status: "REFUNDED" }
                    })
                    return res.status(200).json({ 
                        message: "Your refund was successful",
                        refunded: amount,
                        remaining: remainingAmount - amount
                    });
                }
                return res.json({ 
                    message: "Refund is being processed",
                    status: stripeRefund.status
                });

            default:
                console.log("[REFUND ERROR] due to unknown transaction status", { transactionStatus: transaction.status })
                res.status(500).json({ error: "Unknown transaction state"})
        }
    } catch (error) {
        console.error("[REFUND FAILED] internal server error", error);
        return res.status(500).json({ error: "Refund failed" });
    }
}

module.exports = processRefunds;