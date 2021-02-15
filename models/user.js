const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  username: String,
  address: String,
  pincode: Number,
  contact: Number
});

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema)
