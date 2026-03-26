class PaymentService {
    constructor(providers) { // when we create an instance of this class, we pass a map of providers(stored in var providers)
        this.providers = providers; // this class remembers this providers internally(this.providers)
    }

    getProvider(providerName) {
        const provider = this.providers[providerName]; // extract provider from our internally stored provider instances 
        if (!provider) {
            throw new Error(`Unsupported provider: ${providerName}. Try another one`)
        }
        return provider;
    }

    createPayment(providerName, data) {
        const provider = this.getProvider(providerName); // extract provider from our previous function
        return provider.createPayment(data) // pass the function to the named provider with the data to process payment e.g. stripe.createPayment(1000)
    }
}

module.exports = PaymentService;