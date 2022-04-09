const mongoose = require("mongoose");
const collection = "places-types";

const objectSchema = {
  name: { type: String, required: true, unique: true },
  description: { type: String },
};
const options = {
  timestamps: true,
};
const schema = new mongoose.Schema(objectSchema, options);

const PlaceType = mongoose.model(collection, schema);

module.exports = PlaceType;
