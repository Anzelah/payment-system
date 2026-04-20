const prisma = require("../utils/prisma")
const getUserMessage = require("../utils/message")


async function getTransactionStatus(status) {
    const reference = req.params
    if (!req.params) {
        return res.status(400).json({ error: "Missing required fieds"})
    }

    const transaction = await prisma.transaction.findUnique({
        where: { reference }
    })
    if (!transaction) {
        return res.status(400).json({ error: "Could not find the transaction for this reference"})
    }

    res.json({
        status: transaction.status,
        message: getUserMessage(transaction.status)
    })
}

module.exports = getTransactionStatus