const mongoose = require("mongoose");
const collection = "reviews";

const objectSchema = {
  comment: { type: String },
  rating: {
    type: Number,
    required: true,
    min: [0, "Rating must be above 0.0"],
    max: [5, "Rating must be below 5.0"],
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "places",
    required: [true, "Review must be associated with one place"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "Review must be associated with one user"],
  },
};
const options = {
  timestamps: true,
};
const schema = new mongoose.Schema(objectSchema, options);

const Review = mongoose.model(collection, schema);

module.exports = Review;