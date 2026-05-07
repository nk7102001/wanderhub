const mongoose = require("mongoose");
const Schema   = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email:   { type: String, required: true },
  avatar:  { url: { type: String, default: "" }, filename: { type: String, default: "" } },
  bio:     { type: String, default: "" },
  phone:   { type: String, default: "" },
  isAdmin: { type: Boolean, default: false },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
  createdAt: { type: Date, default: Date.now },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
