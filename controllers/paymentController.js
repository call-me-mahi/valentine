const Razorpay = require("razorpay");
const crypto = require("crypto");
const { nanoid } = require("nanoid"); // Ensure nanoid@3.3.4 is installed
const LovePage = require("../models/LovePage");

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const AMOUNT_IN_PAISE = 1000; // ₹10
const CURRENCY = "INR";

// 1️⃣ CREATE ORDER
// This is called when the user clicks "Pay ₹20"
exports.createOrder = async (req, res) => {
    try {
        const order = await razorpay.orders.create({
            amount: AMOUNT_IN_PAISE,
            currency: CURRENCY,
            receipt: `receipt_${Date.now()}`,
            notes: { purpose: "Love Journey Page" }
        });

        res.json({ success: true, order });

    } catch (error) {
        console.error("ORDER ERROR:", error);
        res.status(500).json({ success: false, message: "Order creation failed" });
    }
};

// 2️⃣ VERIFY PAYMENT + SAVE ALL USER DETAILS
// This is called after the Razorpay popup succeeds
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            formData // This contains ALL the user's answers from the frontend
        } = req.body;

        // A. Basic Validation
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !formData) {
            return res.status(400).json({ success: false, message: "Invalid payload" });
        }

        // B. Verify Signature (Security Check)
        // This ensures the payment actually came from Razorpay and wasn't faked
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(401).json({ success: false, message: "Payment verification failed" });
        }

        // C. Generate Unique Slug (The URL ID)
        // Example: localhost:5173/love/xYz123a
        let slug;
        let exists = true;
        while (exists) {
            slug = nanoid(7); // Generates a short, URL-friendly ID
            exists = await LovePage.exists({ slug });
        }

        // D. Set Expiry (7 Days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // E. SAVE TO DATABASE (Mapping Every Single Field)
        // We explicitly map fields to ensure security and schema compliance
        const lovePage = await LovePage.create({
            // Technical Fields
            slug: slug,
            isPaid: true,
            paymentId: razorpay_payment_id,
            expiresAt: expiresAt,

            // 🟢 Common Fields (Identity & Theme)
            pageType: formData.pageType, // 'confession' or 'relationship'
            yourName: formData.yourName,
            partnerName: formData.partnerName,
            yourGender: formData.yourGender,
            partnerGender: formData.partnerGender,
            tone: formData.tone,
            photos: formData.photos, // Array of { url, publicId }

            // 🔵 Relationship Specific Fields
            relationshipStatus: formData.relationshipStatus,
            showYourName: formData.showYourName,
            feelings: formData.feelings,
            memoryEnabled: formData.memoryEnabled,
            memoryType: formData.memoryType,
            memoryText: formData.memoryText,
            appreciation: formData.appreciation,
            appreciationCustom: formData.appreciationCustom,
            future: formData.future,

            // 🟠 Confession Specific Fields
            feelingsStart: formData.feelingsStart,
            admireMost: formData.admireMost,
            nervousLevel: formData.nervousLevel,
            theQuestion: formData.theQuestion
        });

        // F. Success Response
        // Send the slug back so frontend can redirect: /love/:slug
        res.json({
            success: true,
            slug: slug,
            lovePageId: lovePage._id
        });

    } catch (error) {
        console.error("VERIFY ERROR:", error);
        res.status(500).json({ success: false, message: "Payment verified but save failed" });
    }
};