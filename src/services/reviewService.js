const Review = require("../models/Review");

// **Get All Reviews**
const getReviews = async () => {
  try {
    return await Review.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Get Review By ID**
const getReviewById = async (id) => {
  try {
    const review = await Review.findById(id);
    if (!review) throw new Error("Review not found");
    return review;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Create Review**
const createReview = async (reviewData) => {
  try {
    const review = new Review(reviewData);
    return await review.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Update Review**
const updateReview = async (id, updateData) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedReview) throw new Error("Review not found");
    return updatedReview;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Delete Review**
const deleteReview = async (id) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) throw new Error("Review not found");
    return { message: "Review deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
