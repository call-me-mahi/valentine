const mongoose = require("mongoose");
const LovePage = require("../models/LovePage");
const cloudinary = require("../config/cloudinary");


// ❤️ UPLOAD IMAGES TO CLOUDINARY
exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const uploadedImages = [];

        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "valentine"
            });

            uploadedImages.push(result.secure_url);
        }

        res.json({ success: true, photos: uploadedImages });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({ success: false, error: error.message });
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
            photos,
            music,
            theme
        } = req.body;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newPage = await LovePage.create({
            yourGender,
            yourName,
            partnerGender,
            partnerName,
            firstMeeting,
            favoriteMemory,
            message,
            photos,
            music,
            theme,
            expiresAt
        });

        res.status(201).json({
            success: true,
            id: newPage._id,
            message: "Love page created successfully"
        });

    } catch (error) {
        console.error("CREATE ERROR:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};



// 💖 GET LOVE PAGE BY ID
exports.getLovePageById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid page ID" });
        }

        const page = await LovePage.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ success: false, message: "Love page not found" });
        }

        res.json({ success: true, data: page });

    } catch (error) {
        console.error("GET ERROR:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};
