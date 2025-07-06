const express = require("express");
const router = express.Router();
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require("../services/reviewService");

// **Get All Reviews**
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await getReviews();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Review By ID**
router.get("/reviews/:id", async (req, res) => {
  try {
    const review = await getReviewById(req.params.id);
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Create Review**
router.post("/reviews", async (req, res) => {
  try {
    const review = await createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// **Update Review**
router.put("/reviews/:id", async (req, res) => {
  try {
    const updatedReview = await updateReview(req.params.id, req.body);
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Delete Review**
router.delete("/reviews/:id", async (req, res) => {
  try {
    const result = await deleteReview(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
