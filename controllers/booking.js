const Booking  = require("../models/booking.js");
const Listing  = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

/* ── helper ── */
function nightsBetween(checkIn, checkOut) {
  return Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
}

/* GET /bookings/new?listingId=xxx  – booking form */
module.exports.renderNewForm = async (req, res) => {
  if (!req.query.listingId) {
    req.flash("error", "No listing specified.");
    return res.redirect("/listings");
  }
  const listing = await Listing.findById(req.query.listingId);
  if (!listing) throw new ExpressError(404, "Listing not found");

  // Dates already booked for this listing
  const existingBookings = await Booking.find({
    listing: listing._id,
    status: { $in: ["confirmed", "pending"] },
    checkOut: { $gte: new Date() },
  }).select("checkIn checkOut -_id");

  res.render("bookings/new", { listing, existingBookings });
};

/* POST /bookings  – create booking */
module.exports.create = async (req, res) => {
  const { listingId, checkIn, checkOut, guests, specialRequests } = req.body;
  const listing = await Listing.findById(listingId);
  if (!listing) throw new ExpressError(404, "Listing not found");

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) {
    req.flash("error", "Check-out must be after check-in!");
    return res.redirect(`/bookings/new?listingId=${listingId}`);
  }

  // Overlap check
  const conflict = await Booking.findOne({
    listing: listingId,
    status: { $in: ["confirmed", "pending"] },
    $or: [
      { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } },
    ],
  });
  if (conflict) {
    req.flash("error", "Those dates are already booked. Please choose different dates.");
    return res.redirect(`/bookings/new?listingId=${listingId}`);
  }

  const totalPrice = listing.price * nights;

  const booking = new Booking({
    listing: listingId,
    guest: req.user._id,
    checkIn, checkOut,
    guests: guests || 1,
    nights,
    totalPrice,
    specialRequests,
  });
  await booking.save();

  req.flash("success", `Booking confirmed! 🎉 ₹${totalPrice.toLocaleString("en-IN")} for ${nights} night${nights > 1 ? "s" : ""}`);
  res.redirect("/bookings/my");
};

/* GET /bookings/my  – user's booking history */
module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });
  res.render("bookings/my", { bookings });
};

/* DELETE /bookings/:id  – cancel a booking */
module.exports.cancel = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ExpressError(404, "Booking not found");
  if (!booking.guest.equals(req.user._id)) throw new ExpressError(403, "Not your booking");

  if (new Date(booking.checkIn) <= new Date()) {
    req.flash("error", "Cannot cancel a booking that has already started.");
    return res.redirect("/bookings/my");
  }

  booking.status = "cancelled";
  await booking.save();
  req.flash("success", "Booking cancelled successfully.");
  res.redirect("/bookings/my");
};
