// function to process mpesa payments. mpesa implementation and logic goes here
class MpesaProvider {
    async createPayment(data) {
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