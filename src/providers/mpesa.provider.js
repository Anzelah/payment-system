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

    async generateToken(data) {
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
          req.token = response.access_token
          next()
      } catch (error) {
          console.error(`Failed to generate access token: ${error.message}`)
          return res.status(401).json({ error: "Incorrect or expired access token"})
      }
  }
}
  
  module.exports = MpesaProvider;