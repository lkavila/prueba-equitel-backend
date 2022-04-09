/* eslint-disable prefer-regex-literals */
const validateUser = (req, res, next) => {
  console.log(req.body);
  const {
    name,
    username,
    password,
    passwordConfirmation,
    role = "registered",
  } = req.body;

  const errors = [];
  const regExpPassword = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
  );
  const regExpRole = new RegExp(/^(admin|registered)$/);

  if (name && username && password && passwordConfirmation && role) {
    if (name.length < 3) {
      errors.push("errors.validate.invalidName");
    }

    if (username.length < 6) {
      errors.push("errors.validate.invalidUsername");
    }

    if (password !== passwordConfirmation) {
      errors.push("errors.validate.passwordsDontMatch");
    }

    if (!regExpPassword.test(password)) {
      errors.push("errors.validate.invalidPassword");
    }

    if (!regExpRole.test(role)) {
      errors.push("errors.validate.invalidRole");
    }
  } else {
    errors.push("errors.validate.emptyData");
  }

  if (errors.length === 0) {
    next();
  } else {
    res.status(500).json({ message: errors });
  }
};

module.exports = {
  validateUser,
};
