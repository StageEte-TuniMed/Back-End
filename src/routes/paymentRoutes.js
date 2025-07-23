const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Create payment intent
router.post("/create-payment-intent", paymentController.createPaymentIntent);

// Verify payment status
router.post("/verify-payment", paymentController.verifyPayment);

// Update appointment payment status
router.put("/update-payment-status", paymentController.updatePaymentStatus);

module.exports = router;
