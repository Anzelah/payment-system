// function to process all stripe payments. stripe implementation and logic goes here
class StripeProvider {
    async createPayment(data) {
      try {
        const amount = parseInt(data.amount)
        const currency = data.currency
        const reference = data.reference
        const transactionId = data.transactionId
 
        const session = await stripe.checkout.sessions.create({ // server to server communication with stripe
            mode: "payment",
            payment_method_type: 'card',
            line_items: [{
                price_data: {
                    currency,
                    unit_amount: amount,
                    product_data: {
                      name: "payment",
                    },
                },
                quantity: 1,
                }],
            success_url: 'http://localhost:3000/dashboard?stripe=success',
            cancel_url: 'http://localhost:3000/dashboard?stripe=cancel',
            metadata: {
                reference,
                transactionId //db lookup
            }
        })

        res.json({ url: session.url })
    } catch(error) {
        next(error)
    }
  }
  
    async handleWebhook(payload) {
      console.log("Stripe webhook received", payload);
    }
  }
  
  module.exports = StripeProvider;