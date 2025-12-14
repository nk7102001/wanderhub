const Listing = require("../models/listing.js");

/**
 * INDEX – show all listings / category / search / category + search
 * URLs:
 *  /listings
 *  /listings?category=Mountains
 *  /listings?search=Malibu
 *  /listings?category=Mountains&search=Aspen
 */
module.exports.index = async (req, res) => {
  const { category, search } = req.query;

  let query = {};

  // ENUM safety
  const allowedCategories = Listing.schema.path("category").enumValues;

  // CATEGORY FILTER
  if (category && allowedCategories.includes(category)) {
    query.category = category;
  }

  // SEARCH FILTER (location, country, title)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  const allListings = await Listing.find(query);

  res.render("listings/index", {
    allListings,
    category,
    search,
  });
};

/**
 * NEW LISTING FORM
 */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

/**
 * SHOW SINGLE LISTING
 */
module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

/**
 * CREATE LISTING
 */
module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

/**
 * EDIT FORM
 */
module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit", { listing });
};

/**
 * UPDATE LISTING
 */
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    new: true,
  });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

/**
 * DELETE LISTING
 */
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
