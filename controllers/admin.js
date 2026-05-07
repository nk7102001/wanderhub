const Listing = require("../models/listing.js");
const User    = require("../models/user.js");
const Review  = require("../models/review.js");
const Booking = require("../models/booking.js");

module.exports.dashboard = async (req, res) => {
  const [
    totalListings,
    totalUsers,
    totalReviews,
    totalBookings,
    recentListings,
    recentUsers,
    recentBookings,
    categoryStats,
    revenueStats,
  ] = await Promise.all([
    Listing.countDocuments(),
    User.countDocuments(),
    Review.countDocuments(),
    Booking.countDocuments({ status: "confirmed" }),
    Listing.find().sort({ createdAt: -1 }).limit(6).populate("owner"),
    User.find().sort({ createdAt: -1 }).limit(5),
    Booking.find().sort({ createdAt: -1 }).limit(5).populate("listing guest"),
    Listing.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenue = revenueStats[0]?.total || 0;
  const avgBookingValue = revenueStats[0]
    ? Math.round(revenueStats[0].total / revenueStats[0].count)
    : 0;

  res.render("admin/dashboard", {
    stats: { totalListings, totalUsers, totalReviews, totalBookings, totalRevenue, avgBookingValue },
    recentListings,
    recentUsers,
    recentBookings,
    categoryStats,
  });
};

module.exports.allListings = async (req, res) => {
  const listings = await Listing.find().populate("owner").sort({ createdAt: -1 });
  res.render("admin/listings", { listings });
};

module.exports.allUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  // For each user get listing count
  const usersWithCount = await Promise.all(
    users.map(async (u) => {
      const count = await Listing.countDocuments({ owner: u._id });
      return { ...u.toObject(), listingCount: count };
    })
  );
  res.render("admin/users", { users: usersWithCount });
};

module.exports.allBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("listing guest")
    .sort({ createdAt: -1 });
  res.render("admin/bookings", { bookings });
};

module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted by admin.");
  res.redirect("/admin/listings");
};

module.exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  req.flash("success", "User deleted by admin.");
  res.redirect("/admin/users");
};
