const mongoose = require("mongoose");

const lovePageSchema = new mongoose.Schema({
    // 🔗 Shareable slug
    slug: { type: String, required: true, unique: true },

    // 💳 Payment state
    isPaid: { type: Boolean, default: false },
    paymentMeta: {
        razorpay_order_id: String,
        razorpay_payment_id: String
    },

    // 👤 User details
    yourGender: { type: String, required: true },
    yourName: { type: String, required: true },

    partnerGender: { type: String, required: true },
    partnerName: { type: String, required: true },

    // 💌 Memories
    firstMeeting: { type: String, required: true },
    favoriteMemory: { type: String, required: true },
    message: { type: String, required: true },

    // 🖼️ Media (IMPORTANT CHANGE)
    photos: [
        {
            url: String,
            publicId: String
        }
    ],

    music: { type: String, default: null },

    // 🎨 Theme
    theme: { type: String, default: "default" },

    // ⏳ Timestamps
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

module.exports = mongoose.model("LovePage", lovePageSchema);
