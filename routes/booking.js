const express    = require("express");
const router     = express.Router();
const { isLoggedIn } = require("../middlewares.js");
const wrapAsync  = require("../utils/wrapAsync.js");
const ctrl       = require("../controllers/booking.js");

router.get("/new",  isLoggedIn, wrapAsync(ctrl.renderNewForm));
router.post("/",    isLoggedIn, wrapAsync(ctrl.create));
router.get("/my",   isLoggedIn, wrapAsync(ctrl.myBookings));
router.post("/:id/cancel", isLoggedIn, wrapAsync(ctrl.cancel));

module.exports = router;
