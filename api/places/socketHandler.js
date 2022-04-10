const Place = require("./model");
const { getPlaceTypeByName } = require("../services/placeService");

module.exports = (io, socket) => {

  const list = async (pagination) => {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    Place.find()
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 })
      .then(async (places) => {
        const total = await Place.estimatedDocumentCount();
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;
        const data = {
          hasMore,
          totalPages,
          total,
          data: places,
          currentPage: page,
        };
        socket.emit("emitted:places:list", data);
      });
  };

  const listPlacesWithReviews = async (pagination) => {
    const { maxDistance = 10000, limit = 50, page = 1 } = pagination;
    const mDistance = maxDistance * 1000;
    const skip = (page - 1) * limit;
    const lookupForReviews = {
      from: "reviews",
      let: {
        placeId: "$_id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$place", "$$placeId"],
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 4 },
      ],
      as: "reviews",
    };

    const near = {
      near: { type: "Point", coordinates: [-122.5, 37.7] },
      distanceField: "dist.calculated",
      maxDistance: mDistance,
      spherical: true,
    };

    const lookupForType = {
      from: "places-types",
      localField: "type",
      foreignField: "_id",
      as: "type",
    };

    const lookupForUser = {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    };

    const unwindUser = {
      path: "$user",
      preserveNullAndEmptyArrays: false,
    };

    const proyectUser = {
      "user._id": 0,
      "user.password": 0,
    }

    const unwindType = {
      path: "$type",
      preserveNullAndEmptyArrays: false,
    };

    const result = await Place.aggregate([
      { $geoNear: near },
      //{ $lookup: lookupForReviews },
      { $limit: limit },
      { $skip: skip },
      { $lookup: lookupForUser },
      { $unwind: unwindUser },
      { $project: proyectUser },
      { $lookup: lookupForType },
      { $unwind: unwindType },
    ]);
    const data = {
      places: result,
      message: "ok",
    };
    return data;
  };

  const getPlacesWithReviews = async (pagination) => {
    const data = await listPlacesWithReviews(pagination);
    socket.emit("emitted:places:getPlaces", data);
  };

  const create = async (place) => {
    const { description, typeName, name, location } = place;
    const placeType = await getPlaceTypeByName(typeName);
    let data = {
      message: "PlaceType does not exits",
      error: true,
    };
    if (!placeType) {
      return socket.emit("emitted:places:create", data);
    }
    const placeAux = {
      description,
      user: socket.handshake.auth,
      type: placeType._id,
      name,
      location,
    };

    const newPlace = new Place(placeAux);
    newPlace.save().then(async (createdPlace) => {
      data = {
        message: "ok",
        createdObject: createdPlace,
      };

      socket.emit("emitted:places:create", data);

      const list = await listPlacesWithReviews({});
      io.emit("emitted:places:getPlaces", list);
    });
  };

  const update = async (place) => {
    const { _id, description, typeName, name, location } = place;
    const userId = socket.handshake.auth;
    let data = { message: "Invalid id", error: true };
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
      return socket.emit("emitted:places:update", data);
    }

    const foundPlace = await Place.find({ _id: _id, user: userId });
    if (!foundPlace) {
      data = {
        message: "Place does not exits or was not created by user",
        error: true,
      };
      return socket.emit("emitted:places:update", data);
    }

    const placeType = await getPlaceTypeByName(typeName);
    if (!placeType) {
      data = { message: "This place type does not exits", error: true };
      return socket.emit("emitted:places:update", data);
    }

    const updated = await Place.updateOne(
      { _id: _id },
      { description, type: placeType._id, name, location },
    );
    if (updated && updated.modifiedCount === 1) {
      data = { message: "ok" };
    } else {
      data = { message: "Place was not updated", error: true };
    }
    return socket.emit("emitted:places:update", data);
  };

  const deletePlace = async (id) => {
    let data = { message: "Invalid id", error: true };
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return socket.emit("emitted:places:delete", data);
    }

    const query = await Place.findOneAndDelete({ _id: id });
    if (query) {
      data = { message: "ok", query };
    } else {
      data = { message: "Place was not Deleted", error: true };
    }
    return socket.emit("emitted:places:delete", data);
  };

  socket.on("places:create", create);
  socket.on("places:list", list);
  socket.on("places:getPlaces", getPlacesWithReviews);
  socket.on("places:update", update);
  socket.on("places:delete", deletePlace);
};