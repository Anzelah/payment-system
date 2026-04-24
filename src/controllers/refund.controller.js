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
                const refund = await stripe.refunds.create({
                    payment_intent: transaction.paymentIntentId,
                    reason: "requested_by_customer" // in frontend, user will choose the reason then autofill here
                })
                console.log("[REFUND CREATED]", refund.id);

                if (refund.status === "succeeded") {
                    await prisma.transaction.update({
                        where: { reference },
                        data: { status: "REFUNDED" }
                    })
                    return res.status(200).json({ message: "Your refund was successful" });
                }
                return res.json({ 
                    message: "Refund is being processed",
                    status: refund.status
                });

            default:
                console.log("[REFUND ERROR] due to unknown transaction status", { transactionStatus: transaction.status })
                res.status(500).json({ error: "Unknown transaction state"})
        }
    } catch (error) {
        console.error("[REFUND FAILED] internal server error", err);
        return res.status(500).json({ error: "Refund failed" });
    }
}

module.exports = processRefunds;