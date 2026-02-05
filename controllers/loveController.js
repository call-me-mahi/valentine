const mongoose = require("mongoose");
const LovePage = require("../models/LovePage");


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
        expiresAt.setDate(expiresAt.getDate() + 7); // auto delete logic later

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
        // 🛑 Prevent server crash if ID is invalid
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid page ID" });
        }

        const page = await LovePage.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ success: false, message: "Love page not found" });
        }

        res.json({ success: true, data: page });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};
