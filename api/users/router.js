const express = require("express");
const { validateUser } = require("../middlewares/validator");
const { get, create, login, list } = require("./controller");

const router = express.Router();

router.get("/", list);

router.route("/:username").get(get);

router.route("/register").post(validateUser, create);

router.route("/login").post(login);

module.exports = router;
