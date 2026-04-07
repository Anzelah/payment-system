// function to process mpesa payments. mpesa implementation and logic goes here
class MpesaProvider {
    async createPayment(data) {
      const { amount, currency, reference, transactionId } = data
      url = https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
      const response = await axios.post(url, data)
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

    async generateToken() {
      const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      const consumerKey = process.env.MPESA_CONSUMER_KEY
      const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  
      // BASE64 encode cnsumer key + secret
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
  
      // get access token
      try {
          const response = await axios.get(url,
          { headers: {
              Authorization: `Basic ${auth}`
          } 
          })
          return response.access_token
      } catch (error) {
          console.error(`Failed to generate access token: ${error.message}`)
          throw error
      }
  }
}
  
  module.exports = MpesaProvider;