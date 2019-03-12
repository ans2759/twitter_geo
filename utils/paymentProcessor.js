exports.processPayment = (paymentInfo, amount) => {
    return new Promise((resolve, reject) => {
        if (paymentInfo.isValid) {
            resolve()
        } else {
            reject("Error processing payment")
        }
    });
};