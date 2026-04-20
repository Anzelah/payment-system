// function to process all stripe payments. stripe implementation and logic goes here
class StripeProvider {
  async createPayment(data) {
    try {
      const { amount, currency, reference, transactionId } = data

      const session = await stripe.checkout.sessions.create({ // server to server communication with stripe
          mode: "payment",
          payment_method_types: ['card'],
          line_items: [{
              price_data: {
                  currency,
                  unit_amount: parseInt(amount),
                  product_data: {
                    name: "payment",
                  },
              },
              quantity: 1,
              }],
          success_url: 'http://localhost:5000/dashboard?stripe=success',
          cancel_url: 'http://localhost:5000/dashboard?stripe=cancel',
          metadata: {
              reference,
              transactionId //db lookup
          }
      })
      console.log("[CHECKOUT SESSION INITIALIZED]:", { currency: currency, amount: amount, transaction_id: transactionId })

      return {
        message: "Payment initiated succesfully", 
        url: session.url,
        provider: "stripe",
        status: "PENDING"
      }
    } catch(error) {
      console.error("[STIPE PROVIDER ERROR]:", error.message)
      throw error
    }
  }
}
  
module.exports = StripeProvider;