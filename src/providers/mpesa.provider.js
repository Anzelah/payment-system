// function to process mpesa payments. mpesa implementation and logic goes here
class MpesaProvider {
    async createPayment(data) {
      // Only implementation of the mpesa stk push(stripe-checout-session equivalent) is done here. the other is in webhook controller
      console.log("M-Pesa payment initiated", data);
  
      return {
        provider: "mpesa",
        status: "pending",
      };
    }
  
    async handleWebhook(payload) {
      console.log("M-Pesa callback received", payload);
    }
  }
  
  module.exports = MpesaProvider;