const StripeProvider = require('./providers/stripe.provider');
const MpesaProvider = require('./providers/mpesa.provider');
const PaymentService = require('./services/payment.service');

const paymentService = new PaymentService({
  stripe: new StripeProvider(),
  mpesa: new MpesaProvider(),
});

module.exports = paymentService;