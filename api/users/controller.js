const User = require("./model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { config } = require("../../config");
const { findUserByUsername } = require("../services/userService");

const list = async (req, res) => {
  const users = await User.find({ active: true });
  res.status(200).json(users);
}

const get = async (req, res) => {
  const user = await findUserByUsername(req.params.username);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User Not Found" });
  }
};

const create = async (req, res) => {
  const { name, username, password } = req.body;
  const userFound = await findUserByUsername(username);
  if (!userFound) {
    const user = {
      name: name,
      password,
      username,
    };

    const newUser = new User(user);
    newUser.save().then((createdUser) => {
      res.status(200).json({ createdObject: createdUser });
    });
  } else {
    res.status(400).json({ message: "username already exits" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "errors.user.usernameOrPasswordEmpty" });
  }
  const foundUser = await User.findOne({ active: true, username });
  if (foundUser) {
    // eslint-disable-next-line no-underscore-dangle
    const userId = foundUser._id;
    const result = await bcrypt.compare(password, foundUser.password);
    if (result) {
      const token = jwt.sign({ userId }, config.jwtKey);
      const cookieProps = {
        maxAge: 60 * 60 * 24 * 1000,
      };

      return res
        .status(200)
        .cookie("token", token, cookieProps)
        .json({
          data: {
            username: foundUser.username,
            name: foundUser.name,
            token: token,
          },
          message: "ok",
        });
    } else {
      res.status(400).json({ message: "errors.user.userNotExists" });
    }
  } else {
    res.status(400).json({ message: "errors.user.userNotExists" });
  }
};

module.exports = {
  get,
  create,
  login,
  list,
};
