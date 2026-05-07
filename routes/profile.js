const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares.js");
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// GET profile
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  const myListings = await Listing.find({ owner: req.user._id });
  res.render("profile/index", { user, myListings });
}));

// GET edit profile form
router.get("/edit", isLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("profile/edit", { user });
}));

// PUT update profile
router.put("/", isLoggedIn, upload.single("avatar"), wrapAsync(async (req, res) => {
  const { bio, phone, email } = req.body;
  const user = await User.findById(req.user._id);
  user.bio = bio;
  user.phone = phone;
  user.email = email;
  if (req.file) {
    user.avatar = { url: req.file.path, filename: req.file.filename };
  }
  await user.save();
  req.flash("success", "Profile updated successfully!");
  res.redirect("/profile");
}));

module.exports = router;
