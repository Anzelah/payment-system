// function to process all stripe payments. stripe implementation and logic goes here
class StripeProvider {
    async createPayment(data) {
      console.log("Stripe payment initiated", data);
  
      // Later: integrate real Stripe logic
      return {
        provider: "stripe",
        status: "pending",
      };
    }
  
    async handleWebhook(payload) {
      console.log("Stripe webhook received", payload);
    }
  }
  
  module.exports = StripeProvider;