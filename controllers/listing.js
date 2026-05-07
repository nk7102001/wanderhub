const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
  const { category, search, sort } = req.query;
  let query = {};

  const allowedCategories = Listing.schema.path("category").enumValues;
  if (category && allowedCategories.includes(category)) {
    query.category = category;
  }

  if (search && search.trim()) {
    query.$or = [
      { title:    { $regex: search.trim(), $options: "i" } },
      { location: { $regex: search.trim(), $options: "i" } },
      { country:  { $regex: search.trim(), $options: "i" } },
    ];
  }

  let sortOption = {};
  if (sort === "price-low")  sortOption = { price: 1 };
  else if (sort === "price-high") sortOption = { price: -1 };
  else if (sort === "newest")     sortOption = { _id: -1 };

  const allListings = await Listing.find(query).sort(sortOption);
  res.render("listings/index", { allListings, category, search: search || "", sort });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let isWishlisted = false;
  if (req.user) {
    const user = await User.findById(req.user._id);
    if (user) {
      isWishlisted = user.wishlist.some(
        (wid) => wid.toString() === listing._id.toString()
      );
    }
  }

  let avgRating = 0;
  if (listing.reviews.length > 0) {
    avgRating = (
      listing.reviews.reduce((sum, r) => sum + r.rating, 0) /
      listing.reviews.length
    ).toFixed(1);
  }

  res.render("listings/show", { listing, isWishlisted, avgRating });
};

module.exports.createListing = async (req, res) => {
  // FIX: guard against missing file
  if (!req.file) {
    req.flash("error", "Please upload an image for your listing.");
    return res.redirect("/listings/new");
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url: req.file.path, filename: req.file.filename };

  await newListing.save();
  req.flash("success", "New Listing Created! 🏠");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { $set: req.body.listing }, { new: true });
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated! ✅");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
