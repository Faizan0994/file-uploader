const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const queries = require("../database/queries");
const passport = require("passport");

const validator = [
  body("fullname")
    .trim()
    .matches(/^[A-Za-z\s]+$/) // Only letters and spaces
    .withMessage("Name must contain only letters and spaces")
    .isLength({ min: 3, max: 25 })
    .withMessage("Name must be between 3 and 25 characters long"),
  body("username")
    .trim()
    .isLength({ min: 3, max: 25 })
    .withMessage("username must be between 3 and 25 characters long"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isLength({ max: 50 })
    .withMessage("Password must not be more than 50 characters long"),
  body("confirm")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const loginValidator = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 25 })
    .withMessage("username must be between 3 and 25 characters long"),
  body("password")
    .trim()
    .isLength({ max: 50 })
    .withMessage("Password must not be more than 50 characters long"),
];

exports.loginGet = (req, res) => {
  if (req.user) return res.redirect("/users/dashboard");
  res.render("login", { errors: null, username: null, password: null });
};

exports.signupGet = (req, res) => {
  res.render("signup", {
    errors: null,
    fullname: null,
    username: null,
    password: null,
    confirm: null,
  });
};

exports.signupPost = [
  validator,
  async (req, res) => {
    const errors = validationResult(req);
    const { fullname, username, password, confirm } = req.body;

    if (!errors.isEmpty()) {
      return res.render("signup", {
        fullname: fullname,
        username: username,
        password: password,
        confirm: confirm,
        errors: errors.array(),
      });
    }

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);

    await queries.registerUser(fullname, username, hashed);

    res.redirect("/");
  },
];

exports.loginPost = passport.authenticate("local", {
  successRedirect: "/users/dashboard",
  failureRedirect: "/auth/login",
});

exports.logoutGet = (req, res, next) => {
  req.logout((e) => {
    if (e) next();
    res.redirect("/");
  });
};
