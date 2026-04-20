function getUserMessage(status) {
    switch (status) {
        case "PENDING":
            return "Please complete the payment on your phone.";
        case "SUCCESS":
            return "Your payment was successful.";
        case "FAILED":
            return "Your payment failed or was cancelled. Please try again.";
        default:
            return "Waiting for payment confirmation..";
    }
}

/*{
    "amount": 1,
    "provider": "mpesa",
    "phone": "254728448629",
    "idempotencyKey": "40073e56-1365-4a7d-a164-daacf6f188c4"
} */

module.exports = getUserMessage