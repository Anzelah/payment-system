const prisma = require("../utils/prisma")
const getUserMessage = require("../utils/message")


async function getTransactionStatus(req, res) {
    try {
        const { reference } = req.params
        if (!reference) {
            return res.status(400).json({ error: "Missing required fieds"})
        }

        const transaction = await prisma.transaction.findUnique({
            where: { reference }
        })
        if (!transaction) {
            return res.status(404).json({ error: "Could not find the transaction for this reference"})
        }

        res.json({
            status: transaction.status,
            message: getUserMessage(transaction.status)
        })
    } catch(error) {
        res.status(500).json({ error: "Something went wrong" })
    }
}

module.exports = getTransactionStatus