const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares.js");
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");

// GET all wishlist items
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("wishlist/index", { wishlist: user.wishlist });
}));

// POST toggle wishlist
router.post("/toggle/:listingId", isLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const listingId = req.params.listingId;
  const idx = user.wishlist.indexOf(listingId);
  if (idx === -1) {
    user.wishlist.push(listingId);
    req.flash("success", "Added to Wishlist ❤️");
  } else {
    user.wishlist.splice(idx, 1);
    req.flash("success", "Removed from Wishlist");
  }
  await user.save();
  res.redirect(req.get('Referrer') || '/listings');
}));

module.exports = router;
