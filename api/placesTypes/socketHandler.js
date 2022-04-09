const PlaceType = require("./model");

module.exports = (io, socket) => {
  const list = async () => {
    const placesTypes = await PlaceType.find();
    let data = {};
    if (placesTypes) {
      data = {
        message: "ok",
        placesTypes,
      };
    } else {
      data = {
        message: "Not found placesTypes",
        error: true,
      };
    }
    return socket.emit("emitted:placesTypes:list", data);
  };

  const create = async (placesTypes) => {
    const placesTypesArray = placesTypes.map((type) => {
      return { name: type };
    });
    let data = {};
    return PlaceType.collection.insertMany(placesTypesArray, function (err, docs) {
      if (err && err !== {}) {
        data = {
          error: true,
          message: err,
        };
      } else {
        data = {
          message: "ok",
          createdObjects: docs,
        };
      }

      return socket.emit("emitted:placesTypes:create", data);
    });

  };

  const update = async (placeType) => {
    const { id, name } = placeType;
    let data = {};
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      data = { message: "Invalid id", error: true };
      return socket.emit("emitted:placesTypes:update", data);
    }

    data = { message: "PlaceType does not exits", error: true };
    const foundPlace = await PlaceType.find({
      _id: id,
      user: socket.handshake.auth,
    });
    if (!foundPlace) {
      return socket.emit("emitted:placesTypes:update", data);
    }

    const updated = await PlaceType.updateOne({ _id: id }, { name });
    if (updated && updated.modifiedCount === 1) {
      data = { message: "ok" };
    } else {
      data = { message: "PlaceType was not updated", error: true };
    }
    return socket.emit("emitted:PlacesTypes:update", data);
  };

  const deletePlaceType = async (id) => {
    let data = {};
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      data = { message: "Invalid id", error: true };
      return socket.emit("emitted:placesTypes:delete", data);
    }

    const query = await PlaceType.findOneAndDelete({ _id: id });
    if (query) {
      data = { message: "ok", query };
    } else {
      data = { message: "PlaceType was not Deleted", error: true };
    }
    return socket.emit("emitted:placesType:delete", data);
  };

  socket.on("placesTypes:list", list);
  socket.on("placesTypes:create", create);
  socket.on("placesTypes:update", update);
  socket.on("placesTypes:delete", deletePlaceType);
};
