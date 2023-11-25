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
  "/signup",
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

    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email already exists. Please try another one." });
      }
      const user = await User.create(matchedData(req));

      res.status(200).json(user);
    } catch (error) {
      return res.status(500).send("Some Error occured");
    }

    // .then((userData) => {
    //   res.json(userData);
    // })
    // .catch((err) => {
    //   res
    //     .status(400)
    //     .json({ message: err.message });
    // });
  }
);

module.exports = router;
