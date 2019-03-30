exports.processPayment = (paymentInfo, amount) => {
    return new Promise((resolve, reject) => {
        if (paymentInfo) {
            resolve()
        } else {
            reject("Error processing payment")
        }
    });
};