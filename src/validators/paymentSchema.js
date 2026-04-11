const { z } = require("zod")

// validate all inputs
const createPaymentSchema = z.object({
    amount: z
        .number({ message: "Amount must be a number" })
        .positive({ message: "Amount must be larger than zero"}),

    currency: z.string()
        .length(3, { message: "Use a valid currency"})
        .toUpperCase()
        .optional(),

    provider: z.enum(["stripe", "mpesa"], {
        errorMap: () => ({ message: "Invalid payment provider selected" })
    }),

    phone: z.string()
        .regex(/^2547\d{8}$/, "Phone number must be in format 2547XXXXXXXX")
        .optional()

})
.refine((data) => {
    if(data.provider === "stripe" && !data.currency) {
        return false
    }
    return true
}, {
    message: "Currency is required for stripe",
    path: ["currency"]
}).refine((data) => {
    if (data.provider === "mpesa" && !data.phone) {
        return false
    }
    return true
}, {
    message: "Phone number is required for mpesa",
    path: ["phone"]
})

module.exports = { createPaymentSchema }