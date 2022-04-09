const User = require("../users/model");

//  Find User By Id
const findUserById = async (userId) => {
  const userFound = await User.findOne({ _id: userId })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      console.error(err);
    });

  return userFound;
};

//  Find User By Username
const findUserByUsername = async (username) => {
  const userFound = await User.findOne({ username: username })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      console.error(err);
    });

  return userFound;
};

module.exports = { findUserById, findUserByUsername };