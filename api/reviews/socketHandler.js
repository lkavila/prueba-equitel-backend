const Review = require("./model");
const { getPlaceById } = require("../services/placeService");

module.exports = (io, socket) => {

  listFourReviews = async (placeId, pagination) => {
    const { page = 1, limit = 4 } = pagination;
    const skip = (page - 1) * limit;
    const reviews = await Review.find({ place: placeId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user.name");
    return reviews;
  }

  const list = async (placeId, pagination) => {
    const list = await listFourReviews(placeId, pagination);
    socket.emit("emitted:review:list", list);
  }
  const listAll = async (placeId) => {
    const reviews = await Review.find({ place: placeId });
    let data = {};
    if (reviews) {
      data = {
        message: "ok",
        reviews,
      };
    } else {
      data = {
        message: "Not reviews found",
        error: true,
      };
    }
    return socket.emit("emitted:review:listAll", data);
  };

  const create = async (review) => {
    const { placeId, rating, comment } = review;
    const place = getPlaceById(placeId);
    let data = {};
    if (!place) {
      data = { message: "Place does not exits", error: true };
      return socket.emit("emitted:review:create", data);
    }
    const newReview = new Review({
      place: placeId,
      rating,
      comment,
      user: socket.handshake.auth,
    });
    newReview.save().then(async (createdReview) => {
      data = {
        message: "ok",
        createdObject: createdReview,
      };

      socket.emit("emitted:review:create", data);

      const list = await listFourReviews(placeId, {});
      io.emit("emitted:review:list", list);
    });
  };

  const update = async (review) => {
    const { id, rating, comment } = review;
    let data = {};
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      data = { message: "Invalid id", error: true };
      return socket.emit("emitted:review:update", data);
    }

    const foundPlace = await Review.find({
      _id: id,
      user: socket.handshake.auth,
    });
    if (!foundPlace) {
      data = { message: "Review does not exits", error: true };
      return socket.emit("emitted:review:update", data);
    }

    const updated = await Review.updateOne({ _id: id }, { rating, comment });
    if (updated && updated.modifiedCount === 1) {
      data = { message: "ok" };
    } else {
      data = { message: "Review was not updated", error: true };
    }
    return socket.emit("emitted:review:update", data);
  };

  const deleteReview = async (id) => {
    let data = {};
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      data = { message: "Invalid id", error: true };
      return socket.emit("emitted:review:delete", data);
    }

    const query = await Review.findOneAndDelete({ _id: id });
    if (query) {
      data = { message: "ok", query };
    } else {
      data = { message: "Review was not Deleted", error: true };
    }
    return socket.emit("emitted:review:delete", data);
  };

  socket.on("review:list", list);
  socket.on("review:listAll", listAll);
  socket.on("review:create", create);
  socket.on("review:update", update);
  socket.on("review:delete", deleteReview);
};