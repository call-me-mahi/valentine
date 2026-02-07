const cron = require("node-cron");
const LovePage = require("../models/LovePage");
const cloudinary = require("../config/cloudinary");

// ⏰ Runs every day at 3 AM
cron.schedule("0 3 * * *", async () => {
    console.log("🧹 Running expired LovePage cleanup job...");

    try {
        const now = new Date();

        // 🔍 Find expired pages
        const expiredPages = await LovePage.find({
            expiresAt: { $lt: now }
        });

        if (expiredPages.length === 0) {
            console.log("✅ No expired pages found");
            return;
        }

        for (const page of expiredPages) {
            // 🖼️ Delete Cloudinary images
            if (page.photos && page.photos.length > 0) {
                for (const photo of page.photos) {
                    if (photo.publicId) {
                        await cloudinary.uploader.destroy(photo.publicId);
                    }
                }
            }

            // 🗑️ Delete DB record
            await LovePage.deleteOne({ _id: page._id });

            console.log(`❌ Deleted LovePage: ${page.slug}`);
        }

        console.log(`🧼 Cleanup complete. Deleted ${expiredPages.length} pages.`);

    } catch (error) {
        console.error("🔥 Cleanup job failed:", error);
    }
});
