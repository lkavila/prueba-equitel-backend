const mongoose = require("mongoose");
const collection = "places";

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const objectSchema = {
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "places-types",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  location: {
    type: pointSchema,
    required: true,
  },
};
const options = {
  timestamps: true,
};

const schema = new mongoose.Schema(objectSchema, options);

const Place = mongoose.model(collection, schema);

module.exports = Place;