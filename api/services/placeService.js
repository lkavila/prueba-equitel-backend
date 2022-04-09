const Place = require("../places/model");
const Review = require("../reviews/model");
const PlaceType = require("../placesTypes/model");
const { ObjectId } = require("mongodb");

const round = (num) => {
  const m = Number((Math.abs(num) * 100).toPrecision(2));
  return Math.round(m) / 100;
};

const updatePlaceRating = async (id) => {
  const result = await Review.aggregate([
    {
      $match: { place: ObjectId(id) },
    },
    {
      $group: {
        _id: null,
        average: {
          $avg: "$rating",
        },
      },
    },
  ]);
  if (result === []) {
    return "Place not found";
  }
  const average = (result[0] && result[0].average) || 0;
  await Place.updateOne(
    { _id: ObjectId(id) },
    { $set: { averageRating: round(average) } },
  );
  return result;
};

const getPlaceById = async (id) => {
  return await Place.findOne({ _id: id });
}

const getPlaceTypeByName = async (name) => {
  return await PlaceType.findOne({ name: name });
};

module.exports = {
  updatePlaceRating,
  getPlaceById,
  getPlaceTypeByName,
};
