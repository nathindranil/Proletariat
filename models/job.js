const mongoose = require("mongoose"),
      Schema = mongoose.Schema

const JobSchema = new Schema({
  title: String,
  description: String,
  date: Date,
  creator: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  category: String
})

module.exports = mongoose.model("Job", JobSchema)
