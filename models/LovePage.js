const mongoose = require("mongoose");

const lovePageSchema = new mongoose.Schema({
    // 🔗 Technical Fields
    slug: { type: String, required: true, unique: true },
    pageType: { type: String, enum: ['confession', 'relationship'], required: true },
    isPaid: { type: Boolean, default: false },
    paymentId: { type: String },
    expiresAt: { type: Date, required: true },

    // 🟢 COMMON IDENTITY FIELDS
    yourName: { type: String, default: "Admirer" },
    partnerName: { type: String, required: true },
    yourGender: { type: String, default: "unknown" },
    partnerGender: { type: String, default: "unknown" },

    // 🎨 Theme & Media
    tone: { type: String }, // "Romantic", "Playful", "Deep", "Cute"
    photos: [
        {
            url: String,
            publicId: String
        }
    ],

    // 🔵 RELATIONSHIP SPECIFIC FIELDS (From LoveForm.jsx)
    relationshipStatus: { type: String }, // "Dating", "Married", etc.
    showYourName: { type: Boolean, default: true },
    feelings: [{ type: String }], // ["Safe", "Loved", "Happy"]

    memoryEnabled: { type: Boolean, default: false },
    memoryType: { type: String }, // "First meeting", "First trip"
    memoryText: { type: String }, // The story of the memory

    appreciation: { type: String }, // "Their Kindness"
    appreciationCustom: { type: String }, // Custom text
    future: { type: String }, // "Traveling the world"

    // 🟠 CONFESSION SPECIFIC FIELDS (From ConfessionForm.jsx)
    feelingsStart: { type: String }, // "When did your feelings begin?"
    admireMost: { type: String },    // "What do you admire most?"
    nervousLevel: { type: String },  // "How nervous are you?"
    theQuestion: { type: String },   // "Will you be mine?"

}, { timestamps: true });

module.exports = mongoose.model("LovePage", lovePageSchema);