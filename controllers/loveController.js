const mongoose = require("mongoose");
const LovePage = require("../models/LovePage");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { nanoid } = require("nanoid"); // Ensure nanoid@3.3.4 is installed

// ❤️ UPLOAD IMAGES TO CLOUDINARY
// Used by PreviewPage.jsx before payment
exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

        // Helper to buffer stream to Cloudinary
        const uploadToCloudinary = (buffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "valentine" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(buffer).pipe(uploadStream);
            });
        };

        const uploadedImages = [];

        // Upload files one by one
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer);

            // 🔥 STORE BOTH URL + publicId (Crucial for optimizations later)
            uploadedImages.push({
                url: result.secure_url,
                publicId: result.public_id
            });
        }

        // Return the array of URLs to the frontend
        res.json({
            success: true,
            photos: uploadedImages
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ❤️ CREATE LOVE PAGE (Free/Manual Route)
// Note: Your main flow uses paymentController.verifyPayment, but this is a backup.
exports.createLovePage = async (req, res) => {
    try {
        const {
            yourGender, yourName, partnerGender, partnerName,
            firstMeeting, favoriteMemory, message, photos = [],
            theme = "default", pageType = "relationship",
            // Add other schema fields if using this route manually
        } = req.body;

        // 🔗 Generate short, shareable slug
        let slug;
        let exists = true;
        while (exists) {
            slug = nanoid(7);
            exists = await LovePage.exists({ slug });
        }

        // ⏳ Expiry (7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newPage = await LovePage.create({
            slug,
            yourGender, yourName, partnerGender, partnerName,
            firstMeeting, favoriteMemory, message,
            photos, theme, pageType,
            expiresAt,
            isPaid: false // Manual creation assumes unpaid/test
        });

        res.status(201).json({
            success: true,
            slug: newPage.slug,
            message: "Love page created successfully"
        });

    } catch (error) {
        console.error("CREATE ERROR:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// 💖 GET LOVE PAGE BY SLUG
// Used by FinalLovePage.jsx to load the story
exports.getLovePageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const page = await LovePage.findOne({ slug });

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Love page not found"
            });
        }

        // ⚠️ CRITICAL: Return the page object DIRECTLY.
        // If we wrapped it in { data: page }, your frontend code (data.partnerName) would break.
        res.json(page);

    } catch (error) {
        console.error("GET ERROR:", error);
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};