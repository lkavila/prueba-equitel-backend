const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const api = require("../api");
const { config } = require("../config");
const registerPlacesHandler = require("../api/places/socketHandler");
const registerReviewsHandler = require("../api/reviews/socketHandler");
const registerPlacesTypesHandler = require("../api/placesTypes/socketHandler");
const { socketAuthenticator } = require("../api/middlewares/authenticator");

const { host, port } = config.http;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", api);
const httpServer = http.createServer(app);
const io = socketIo(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["x-access-token"],
    credentials: true,
  },
});

io.use((socket, next) => {
  socketAuthenticator(socket, next);
});

const onConnection = (socket) => {
  registerPlacesHandler(io, socket);
  registerReviewsHandler(io, socket);
  registerPlacesTypesHandler(io, socket);
};

io.on("connection", onConnection);

const init = () => {
  httpServer.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
};

module.exports = { init };