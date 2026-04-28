const prisma = require("../utils/prisma")
const getUserMessage = require("../utils/message")
const withRetry = require("../utils/dbRetry")


async function getTransactionNotification(req, res) {
    try {
        const { reference } = req.params
        if (!reference) {
            return res.status(400).json({ error: "Missing required fieds"})
        }
        console.log("[REFERENCE PRESENT]:", reference)

        const transaction = await withRetry(() =>
            prisma.transaction.findUnique({
                where: { reference }
            })
        )
        if (!transaction) {
            return res.status(404).json({ error: "Could not find the transaction for this reference"})
        }
        console.log("[NOTIFICATION PROCESS] Transaction found:", transaction.id)

        res.json({
            status: transaction.status,
            message: getUserMessage(transaction.status)
        })
    } catch(error) {
        res.status(500).json({ error: "Something went wrong" })
    }
}

module.exports = getTransactionNotification