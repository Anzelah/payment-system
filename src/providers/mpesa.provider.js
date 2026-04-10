const axios = require("axios")

// function to process mpesa payments. mpesa implementation and logic goes here
class MpesaProvider {
  constructor(){
    this.consumerKey = process.env.MPESA_CONSUMER_KEY
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET
    this.shortCode = process.env.BUSINESS_SHORT_CODE
    this.passkey = process.env.MPESA_PASSKEY
    this.callbackUrl = process.env.MPESA_CALLBACK_URL
  }

  async createPayment(data) {
    try {
      const { amount, phone, reference, transactionId } = data
      if (!phone) {
        throw new Error("Phone number is required for M-Pesa payments")
      }
    
      const token = await this.generateToken()
      const timestamp = this.generateTimestamp()
      const password = this.generatePassword(timestamp)

      const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
      const payload = {
        Password: password,
        BusinessShortCode: this.shortCode,
        Timestamp: timestamp,
        Amount: amount,
        PartyA: phone,
        PartyB: this.shortCode,
        TransactionType: "CustomerPayBillOnline",
        PhoneNumber: phone,
        AccountReference: reference,
        CallBackURL: this.callbackUrl,
        TransactionDesc: "payment"
      }
      const response = await axios.post(url, payload, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })

      // for mpesa db lookup later
      const checkoutRequestId = response.data.CheckoutRequestID;
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { checkoutRequestId }
      })
  
      return {
        provider: "mpesa",
        message: response.data.customerMessage,
        checkoutRequestId,
        status: "PENDING"
      };
    } catch(error) {
      console.error("Mpesa error:", error.message)
      throw error
    }
  }

  async generateToken() {
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    // BASE64 encode consumer key + secret
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64")

    // get access token
    try {
        const response = await axios.get(url, { headers:
          {
            Authorization: `Basic ${auth}`
          } 
        })
        return response.data.access_token
    } catch (error) {
        console.error(`Failed to generate access token: ${error.message}`)
        throw error
    }
  }

  generateTimestamp() {
    const date = new Date()

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hrs = String(date.getHours()).padStart(2, "0")
    const min = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return `${year}${month}${day}${hrs}${min}${seconds}`

  }

  generatePassword(timestamp) {
    const password = Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString("base64")

    return password
  }
}
  
module.exports = MpesaProvider;