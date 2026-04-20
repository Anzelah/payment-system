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

module.exports = getUserMessage