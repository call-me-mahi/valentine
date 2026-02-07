const mongoose = require("mongoose");
const LovePage = require("../models/LovePage");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { nanoid } = require("nanoid");


// ❤️ UPLOAD IMAGES TO CLOUDINARY
exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

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

        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer);

            // 🔥 STORE BOTH URL + publicId (IMPORTANT)
            uploadedImages.push({
                url: result.secure_url,
                publicId: result.public_id
            });
        }

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



// ❤️ CREATE LOVE PAGE
exports.createLovePage = async (req, res) => {
    try {
        const {
            yourGender,
            yourName,
            partnerGender,
            partnerName,
            firstMeeting,
            favoriteMemory,
            message,
            photos = [],
            music = null,
            theme = "default"
        } = req.body;

        // 🔗 Generate short, shareable slug
        const slug = nanoid(7);

        // ⏳ Expiry (7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newPage = await LovePage.create({
            slug,
            yourGender,
            yourName,
            partnerGender,
            partnerName,
            firstMeeting,
            favoriteMemory,
            message,
            photos, // contains { url, publicId }
            music,
            theme,
            expiresAt
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

        res.json({
            success: true,
            data: page
        });

    } catch (error) {
        console.error("GET ERROR:", error);
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};
