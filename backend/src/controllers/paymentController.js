const razorpayInstance = require('../config/razorpay');

/**
 * Create a Razorpay order
 * @route POST /api/payment/create-order
 */
const createOrder = async (req, res, next) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required',
            });
        }

        // Create order options
        const options = {
            amount: amount, // Amount in smallest currency unit (paise for INR)
            currency: currency,
            receipt: `receipt_${Date.now()}`, // Unique receipt ID
            payment_capture: 1, // Auto capture payment
        };

        // Create order via Razorpay API
        const order = await razorpayInstance.orders.create(options);

        // Send response
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        next(error);
    }
};

module.exports = {
    createOrder,
};
