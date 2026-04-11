const { z } = require("zod")

// validate all inputs
const createPaymentSchema = z.object({
    amount: z
        .number({ message: "Amount must be a number" })
        .positive({ message: "Amount must be larger than zero"}),

    currency: z.string()
        .length(3, { message: "Use a valid currency"})
        .optional(),

    provider: z.enum(["stripe", "mpesa"]),

    phone: z.number()
        .regex(/^2547\d{8}$/, "Phone number must be in format 2547XXXXXXXX")
        .length(12, { message: "Phone number must be 12 digits"})
        .optional()
})

module.exports = { createPaymentSchema }