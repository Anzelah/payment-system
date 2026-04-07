// function to process mpesa payments. mpesa implementation and logic goes here
class MpesaProvider {
    async createPayment(data) {
      const { amount, phone } = data
      if (!phone) {
        throw new Error("Phone number is required for M-Pesa payments")
      }
      url = https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
      const businessCode = process.env.BUSINESS_SHORT_CODE
      const password = passkey + businessCode + timestamp
      const response = await axios.post(url, {
        body: {

        }
      })

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

  generateTimestamp() {

  }

  generatePassword() {
    const shortCode = process.env.BUSINESS_SHORT_CODE
    const passkey = process.env.MPESA_PASSKEY
    const timestamp = this.generateTimestamp()

    const password = Buffer.from(`${shortCode}:${passkey}:${timestamp}`).toString("base64")

    return password
  }
}
  
  module.exports = MpesaProvider;