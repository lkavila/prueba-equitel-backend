const Review = require("./model");
const { getPlaceById, updatePlaceRating } = require("../services/placeService");

module.exports = (io, socket) => {

  listFourReviews = async (placeId, pagination) => {
    const { page = 1, limit = 4 } = pagination;
    const reviews = await Review.find({ place: placeId })
      .sort({ createdAt: -1 })
      .limit(page * limit)
      .populate("user", "username");
    const data = {
      reviews,
      message: "ok",
    }
    return data;
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
    const place = await getPlaceById(placeId);
    let data = {};
    if (!place) {
      data = { message: "Place does not exits", error: true };
      return socket.emit("emitted:review:create", data);
    }

    const foundReview = await Review.findOne({ place: placeId, user: socket.handshake.auth });
    if (foundReview) {
      data = { message: "You have already reviewed this place", error: true };
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
      await updatePlaceRating(placeId);
      socket.emit("emitted:review:create", data);

      const list = await listFourReviews(placeId, {});
      io.emit("emitted:review:list", list);
    });
  };

  const update = async (review) => {
    const { id, rating, comment, placeId } = review;
    let data = {};
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      data = { message: "Invalid id", error: true };
      return socket.emit("emitted:review:update", data);
    }

    const foundReview = await Review.find({
      _id: id,
      user: socket.handshake.auth,
    });
    if (!foundReview) {
      data = { message: "Review does not exits", error: true };
      return socket.emit("emitted:review:update", data);
    }

    const updated = await Review.updateOne({ _id: id }, { rating, comment });
    if (updated && updated.modifiedCount === 1) {
      data = { message: "ok" };
      await updatePlaceRating(placeId);
    } else {
      data = { message: "Review was not updated", error: true };
    }
    return socket.emit("emitted:review:update", data);
  };

  const deleteReview = async (id, placeId) => {
    let data = {};
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      data = { message: "Invalid id", error: true };
      return socket.emit("emitted:review:delete", data);
    }

    const query = await Review.findOneAndDelete({ _id: id });
    if (query) {
      data = { message: "ok", query };
      await updatePlaceRating(placeId);
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