const express   = require("express");
const router    = express.Router();
const { isLoggedIn, isAdmin } = require("../middlewares.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ctrl      = require("../controllers/admin.js");

router.use(isLoggedIn, isAdmin);

router.get("/",          wrapAsync(ctrl.dashboard));
router.get("/listings",  wrapAsync(ctrl.allListings));
router.get("/users",     wrapAsync(ctrl.allUsers));
router.get("/bookings",  wrapAsync(ctrl.allBookings));
router.post("/listings/:id/delete", wrapAsync(ctrl.deleteListing));
router.post("/users/:id/delete",    wrapAsync(ctrl.deleteUser));

module.exports = router;
