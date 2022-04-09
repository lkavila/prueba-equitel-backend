const jwt = require("jsonwebtoken");
const { config } = require("../../config");

const authenticator = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token)
    return res
      .status(401)
      .json({ message: "header without token", error: true });
  try {
    const decoded = jwt.verify(token, config.jwtKey);
    const { userId } = decoded;
    req.body.userId = userId;

    next();
  } catch (err) {
    res.status(401).json({ message: "errors.notAuthenticated", error: true });
  }
};

const socketAuthenticator = (socket, next) => {
  const token = socket.handshake.headers["x-access-token"];
  let data = {
    socket: socket.id,
    message: "header without token",
    error: true,
  };
  if (!token) {
    console.log(data);
    return socket.emit("emitted:auth:error", data);
  }
  try {
    const decoded = jwt.verify(token, config.jwtKey);
    const { userId } = decoded;
    socket.handshake.auth = userId;
    next();
  } catch (err) {
    data = {
      socket: socket.id,
      message: "errors.notAuthenticated",
      error: true,
    };
    console.log(data);
    return socket.emit("emitted:auth:error", data);
  }
};

module.exports = { authenticator, socketAuthenticator };