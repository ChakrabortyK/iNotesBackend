const express = require("express");
const router = express.Router();
const {
  query,
  validationResult,
  matchedData,
  body,
} = require("express-validator");
const User = require("../models/User.Schema");

router.get("/", query("name").notEmpty(), async (req, res) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    const data = matchedData(req);
    console.log(data);
    return res.send(`Hello, ${data.name}!`);
  }

  res.send({ errors: result.array() });
});

router.post(
  "/",
  [
    body("name")
      .isLength({ min: 5 })
      .withMessage("Name must be at least 5 characters long"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }

    await User.create(matchedData(req))
      .then((userData) => {
        res.json(userData);
      })
      .catch((err) => {
        res
          .status(400)
          .json({ Error: "Duplicate Value error", message: err.message });
      });
    // const { password } = matchedData(req);
    // if (password) {
    //   await body('passwordConfirmation')
    //     .equals(password)
    //     .withMessage('passwords do not match')
    //     .run(req);
    // }matching a password with confirm password
  }
);

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

module.exports = router;
