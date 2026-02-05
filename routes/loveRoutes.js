const express = require("express");
const router = express.Router();
const { createLovePage, getLovePageById } = require("../controllers/loveController");

// SPECIFIC ROUTES FIRST
router.post("/create", createLovePage);

// DYNAMIC ROUTES AFTER
router.get("/:id", getLovePageById);

module.exports = router;
