const express = require("express");
const router = express.Router({ mergeParams: true });  
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReviews, isLoggedIn, isReviewOwner} = require("../middlewares.js")
const reviewController = require("../controllers/review.js");



//  POST ROUTE (add new review)
router.post(
  "/",
  isLoggedIn,
  validateReviews,
  wrapAsync(reviewController.addReview)
);

// DELETE ROUTE (remove a review)
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewOwner,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
