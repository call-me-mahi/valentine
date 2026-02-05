const express = require('express');
const { createOrder } = require('../controllers/paymentController');

const router = express.Router();

// POST /api/payment/create-order
router.post('/create-order', createOrder);

module.exports = router;
