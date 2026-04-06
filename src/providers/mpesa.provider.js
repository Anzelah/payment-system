// function to process mpesa payments. mpesa implementation and logic goes here
class MpesaProvider {
    async createPayment(data) {
      // Only implementation of the mpesa stk push(stripe-checout-session equivalent) is done here. the other is in webhook controller
      console.log("M-Pesa payment initiated", data);
      // what is needed in request: 
      {
        business-short-code,
        password(passkey + business-short-code + timestamp)- Base64-encoded-string,
        timestamp,
        transaction-type,
        amount,
        partyA- Phone-number-receiving-money,
        partyB - the-business-receiving-money(like-uzuri-supermarket),
        phoneNumber - the-number-to-receive-prompt(can-be-same-as-partyA),
        callbackUrl- the-url-where-mpesa-sends-results-to(azn-webhook),
        AccountReference - identifier-fOr-transaction-defined-by-system(to-be-displayed-to-customer-In-prompt),
        TransactionDesc - additional-info
      } // all fields are mandatory except transaction desc
  
      return {
        provider: "mpesa",
        status: "pending",
      };
    }
  }
  
  module.exports = MpesaProvider;