const { z } = require("zod")

const PaymentProvider = z.enum(["mpesa", "stripe"]);
// Prompt validation
const paySchema = z.object({
    amount: z.number().positive,
    currency: z.string().min(2).max(3),
    provider: PaymentProvider,
    idempotencyKey: z.string().min(10),
    phone: z.number().optional()
})

module.exports = { paySchema }